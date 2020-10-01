"use strict";
const fs = require("fs");
const filesJSON = {};
const _privatefileJSON = new Map();
function PrivateFileJSON(filepath, publuc, callback) {
	_privatefileJSON.set(publuc, this);
	this.filepath = filepath;
	this.connections = 1;
	this.publuc = publuc;
	this.readQueue = [];
	fs.readFile(filepath, (err, data) => this.onRead(err, data, callback));
};
PrivateFileJSON.prototype.onRead = function onRead(err, data, callback) {
	if (err === null && data.length > 6)
		Object.assign(this.publuc, Object.assign(JSON.parse(data), this.publuc));
	callback();
	this.hasRead();
};
PrivateFileJSON.prototype.hasRead = function hasRead() {
	for (const callback of this.readQueue) {
		this.connections++;
		callback(this);
	}
	this.readQueue = [];
};
PrivateFileJSON.prototype.awaitRead = function awaitRead(callback) {
	this.readQueue.push(callback);
};
PrivateFileJSON.prototype.write = function write(callback) {
	fs.writeFile(this.filepath, JSON.stringify(this.publuc), err => this.onWrite(err, callback));
};
PrivateFileJSON.prototype.onWrite = function onWrite(callback) {
	err === null ? callback(null) : callback(new Error());
};
PrivateFileJSON.prototype.close = function close() {
	if (--this.connections === 0) {
		_privatefileJSON.delete(this.publuc);
		delete (filesJSON[this.filepath]);
	}
};
class FileJSON {
	constructor(filepath, callback) {
		if (!filesJSON[filepath]) {
			filesJSON[filepath] = this;
			new PrivateFileJSON(filepath, this, () => callback(this));
		}
		else
			_privatefileJSON.get(filesJSON[filepath]).awaitRead(() => callback(this));
	}
	write(callback) {
		_privatefileJSON.get(this).write(callback);
	}
	close() {
		_privatefileJSON.get(this).close();
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });