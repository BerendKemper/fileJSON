"use strict";
const fs = require("fs");
const filesJSON = {};
const _internalfileJSON = new Map();
function InternalFileJSON(filepath, external, callback) {
	_internalfileJSON.set(external, this);
	this.filepath = filepath;
	this.connections = 1;
	this.external = external;
	this.readQueue = [];
	fs.readFile(filepath, { encoding: null }, (error, data) => this.onRead(error, data, callback));
};
InternalFileJSON.prototype.onRead = function onRead(error, data, callback) {
	if (error === null && data.length > 6)
		this.external = Object.setPrototypeOf(JSON.parse(data), FileJSON.prototype);
	filesJSON[this.filepath] = this.external;
	callback(this.external);
	this.hasRead();
};
InternalFileJSON.prototype.hasRead = function hasRead() {
	for (const callback of this.readQueue) {
		this.connections++;
		callback(this.external);
	}
	this.readQueue = [];
};
InternalFileJSON.prototype.awaitRead = function awaitRead(callback) {
	this.readQueue.push(callback);
};
InternalFileJSON.prototype.write = function write(callback) {
	fs.writeFile(this.filepath, JSON.stringify(this.external), error => this.onWrite(error, callback));
};
InternalFileJSON.prototype.onWrite = function onWrite(error, callback) {
	error === null ? callback(null) : callback(error);
};
InternalFileJSON.prototype.close = function close() {
	if (--this.connections === 0) {
		_internalfileJSON.delete(this.external);
		delete (filesJSON[this.filepath]);
	}
};
class FileJSON {
	constructor(filepath, callback) {
		if (!filesJSON[filepath])
			new InternalFileJSON(filepath, this, callback);
		else
			_internalfileJSON.get(filesJSON[filepath]).awaitRead(callback);
	}
	write(callback) {
		_internalfileJSON.get(this).write(callback);
	}
	close() {
		_internalfileJSON.get(this).close();
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });