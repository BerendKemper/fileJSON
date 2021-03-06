"use strict";
const fs = require("fs");
const queueToRead = {};
const filesJSON = {};
const accessKey = Symbol("Internal File JSON");
const accessError = new Error("The internal file JSON is off limits.");
function InternalFileJSON(filepath, external, callback) {
	this.readQueue = [];
	this.readQueue.push(callback);
	queueToRead[filepath] = callback => this.readQueue.push(callback);
	this.filepath = filepath;
	this.external = external;
	this.connections = 0;
	fs.readFile(filepath, { encoding: null }, (error, data) => this.onRead(error, data));
};
InternalFileJSON.prototype = {
	onRead(error, data) {
		if (error === null && data.length > 2)
			this.external = Object.setPrototypeOf(JSON.parse(data), Object.getPrototypeOf(this.external));
		this.external.getInternalFileJSON = key => key === accessKey ? this : accessError;
		filesJSON[this.filepath] = this.external;
		for (const queuedCallback of this.readQueue) {
			this.connections++;
			process.nextTick(queuedCallback, this.external);
		}
		this.readQueue = [];
		delete (queueToRead[this.filepath]);
	},
	write(callback) {
		if (typeof callback === "function")
			fs.writeFile(this.filepath, JSON.stringify(this.external), error => callback(error));
		else
			return new Promise((resolve, reject) => this.writePromise(resolve, reject));
	},
	writePromise(resolve, reject) {
		fs.writeFile(this.filepath, JSON.stringify(this.external), error => error === null ? resolve(error) : reject(error));
	},
	close() {
		if (--this.connections === 0) {
			delete (filesJSON[this.filepath]);
			this.external.getInternalFileJSON = null;
		}
	}
};
function FileJSON(filepath, callback) {
	if (this instanceof FileJSON) {
		if (queueToRead[filepath])
			queueToRead[filepath](callback);
		else if (!filesJSON[filepath])
			new InternalFileJSON(filepath, this, callback);
		else {
			const fileJSON = filesJSON[filepath];
			fileJSON.getInternalFileJSON(accessKey).connections++;
			callback(fileJSON);
		}
	}
	else
		throw TypeError(`Class constructors cannot be invoked without 'new'`);
};
FileJSON.prototype = {
	write(callback) {
		return this.getInternalFileJSON(accessKey).write(callback);
	},
	close() {
		this.getInternalFileJSON(accessKey).close();
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });