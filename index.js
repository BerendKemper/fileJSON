"use strict";
const fs = require("fs");
const filesJSON = {};
const _privatefileJSON = new Map();
function PrivateFileJSON(filepath, publicThis, callback) {
	_privatefileJSON.set(publicThis, this);
	this.filepath = filepath;
	this.connections = 1;
	this.public = publicThis;
	this.readQueue = [];
	fs.readFile(filepath, { encoding: null }, (error, data) => this.onRead(error, data, callback));
};
PrivateFileJSON.prototype.onRead = function onRead(error, data, callback) {
	if (error === null && data.length > 6)
		this.public = Object.setPrototypeOf(JSON.parse(data), FileJSON.prototype);
	callback(this.public);
	this.hasRead();
};
PrivateFileJSON.prototype.hasRead = function hasRead() {
	for (const callback of this.readQueue) {
		this.connections++;
		callback(this.public);
	}
	this.readQueue = [];
};
PrivateFileJSON.prototype.awaitRead = function awaitRead(callback) {
	this.readQueue.push(callback);
};
PrivateFileJSON.prototype.write = function write(callback) {
	fs.writeFile(this.filepath, JSON.stringify(this.public), error => this.onWrite(error, callback));
};
PrivateFileJSON.prototype.onWrite = function onWrite(error, callback) {
	error === null ? callback(null) : callback(error);
};
PrivateFileJSON.prototype.close = function close() {
	if (--this.connections === 0) {
		_privatefileJSON.delete(this.public);
		delete (filesJSON[this.filepath]);
	}
};
class FileJSON {
	constructor(filepath, callback) {
		if (!filesJSON[filepath]) {
			filesJSON[filepath] = this;
			new PrivateFileJSON(filepath, this, callback);
		}
		else
			_privatefileJSON.get(filesJSON[filepath]).awaitRead(callback);
	}
	write(callback) {
		_privatefileJSON.get(this).write(callback);
	}
	close() {
		_privatefileJSON.get(this).close();
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });