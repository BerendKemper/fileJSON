"use strict";
const fs = require("fs");
const queueToRead = {};
const filesJSON = {};
const _internalfileJSON = new Map();
function InternalFileJSON(filepath, external, callback) {
	this.readQueue = [];
	queueToRead[filepath] = callback => this.readQueue.push(callback);
	this.filepath = filepath;
	this.external = external;
	this.connections = 1;
	fs.readFile(filepath, { encoding: null }, (error, data) => this.onRead(error, data, callback));
};
InternalFileJSON.prototype.onRead = function onRead(error, data, callback) {
	if (error === null && data.length > 6)
		this.external = Object.setPrototypeOf(JSON.parse(data), FileJSON.prototype);
	_internalfileJSON.set(this.external, this);
	filesJSON[this.filepath] = this.external;
	process.nextTick(callback, this.external);
	for (const queuedCallback of this.readQueue) {
		this.connections++;
		process.nextTick(queuedCallback, this.external);
	}
	this.readQueue = [];
	delete (queueToRead[this.filepath]);
};
InternalFileJSON.prototype.write = function write(callback) {
	fs.writeFile(this.filepath, JSON.stringify(this.external), error => callback(error));
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