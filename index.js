"use strict";
const fs = require("fs");
const queueToRead = {};
const filesJSON = {};
const _internalfileJSON = new Map();
function InternalFileJSON(filepath, external, resolve) {
	this.readQueue = [];
	queueToRead[filepath] = resolve => this.readQueue.push(resolve);
	this.filepath = filepath;
	this.external = external;
	this.connections = 1;
	fs.readFile(filepath, { encoding: null }, (error, data) => this.onRead(error, data, resolve));
};
InternalFileJSON.prototype.onRead = function onRead(error, data, resolve) {
	if (error === null && data.length > 6)
		this.external = Object.setPrototypeOf(JSON.parse(data), FileJSON.prototype);
	_internalfileJSON.set(this.external, this);
	filesJSON[this.filepath] = this.external;
	process.nextTick(resolve, this.external);
	for (const queuedResolve of this.readQueue) {
		this.connections++;
		process.nextTick(queuedResolve, this.external);
	}
	this.readQueue = [];
	delete (queueToRead[this.filepath]);
};
InternalFileJSON.prototype.write = function write(resolve) {
	fs.writeFile(this.filepath, JSON.stringify(this.external), error => resolve(error));
};
InternalFileJSON.prototype.close = function close() {
	if (--this.connections === 0) {
		_internalfileJSON.delete(this.external);
		delete (filesJSON[this.filepath]);
	}
};
InternalFileJSON.get = function get(internal, filepath, resolve) {
	if (queueToRead[filepath])
		queueToRead[filepath](resolve);
	else if (!filesJSON[filepath])
		new InternalFileJSON(filepath, internal, resolve);
	else {
		const fileJSON = filesJSON[filepath];
		_internalfileJSON.get(fileJSON).connections++;
		resolve(fileJSON);
	}
};
class FileJSON {
	constructor(filepath) {
		return new Promise(resolve => InternalFileJSON.get(this, filepath, resolve));
	}
	write() {
		return new Promise(resolve => _internalfileJSON.get(this).write(resolve));
	}
	close() {
		_internalfileJSON.get(this).close();
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });