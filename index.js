"use strict";
const fs = require("fs");
const queueToRead = {};
const filesJSON = {};
const _internalfileJSON = new Map();
function InternalFileJSON(filepath, external, callback) {
	queueToRead[filepath] = callback => this.awaitRead(callback);
	this.filepath = filepath;
	this.connections = 1;
	this.external = external;
	this.readQueue = [];
	fs.readFile(filepath, { encoding: null }, (error, data) => this.onRead(error, data, callback));
};
InternalFileJSON.prototype.onRead = function onRead(error, data, callback) {
	if (error === null && data.length > 6)
		this.external = Object.setPrototypeOf(JSON.parse(data), FileJSON.prototype);
	_internalfileJSON.set(this.external, this);
	filesJSON[this.filepath] = this.external;
	process.nextTick(callback, this.external);
	this.hasRead();
};
InternalFileJSON.prototype.hasRead = function hasRead() {
	for (const callback of this.readQueue) {
		this.connections++;
		process.nextTick(callback, this.external);
	}
	this.readQueue = [];
	delete (queueToRead[this.filepath]);
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
		if (queueToRead[filepath])
			queueToRead[filepath](callback);
		else if (!filesJSON[filepath])
			new InternalFileJSON(filepath, this, callback);
		else {
			const fileJSON = filesJSON[filepath];
			_internalfileJSON.get(fileJSON).connections++;
			callback(fileJSON);
		}
	}
	write(callback) {
		_internalfileJSON.get(this).write(callback);
	}
	close() {
		_internalfileJSON.get(this).close();
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });