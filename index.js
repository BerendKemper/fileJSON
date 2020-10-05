"use strict";
const fs = require("fs");
const filesJSON = {};
const _filepath = new Map();
const _connections = new Map();
const _hasRead = new Map();
class FileJSON {
	constructor(filepath) {
		let hasRead;
		if (filesJSON[filepath] instanceof FileJSON) {
			const _this = filesJSON[filepath];
			let number = _connections.get(_this);
			_connections.set(_this, ++number);
			hasRead = _hasRead.get(_this);
		}
		else {
			filesJSON[filepath] = this;
			_filepath.set(this, filepath);
			_connections.set(this, 1);
			hasRead = new Promise(resolve => {
				fs.readFile(filepath, (err, data) => {
					if (err === null && data.length > 6)
						Object.assign(this, Object.assign(JSON.parse(data), this));
					resolve(this);
				});
			});
			_hasRead.set(this, hasRead);
		}
		return hasRead;
	}

	write() {
		return new Promise((resolve, reject) => _hasRead.get(this).then(() =>
			fs.writeFile(_filepath.get(this), JSON.stringify(this), err =>
				err === null ? resolve("done") : reject())));
	}
	close() {
		let number = _connections.get(this);
		if (--number === 0) {
			_hasRead.delete(this);
			_connections.delete(this);
			delete (filesJSON[_filepath.get(this)]);
			_filepath.delete(this);
			return;
		}
		_connections.set(this, number);
	}
};
module.exports = Object.freeze({ filesJSON, FileJSON });