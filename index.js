"use strict";
const fs = require("fs");
const filesJSON = {};
const _filepath = new Map();
const _connections = new Map();
const _hasRead = new Map();
class FileJSON {
    constructor(filepath) {
        const hasRead = new Promise((resolve, reject) => {
            if (filesJSON[filepath] instanceof FileJSON === false) {
                filesJSON[filepath] = this;
                _filepath.set(this, filepath);
                _connections.set(this, 1);
                fs.readFile(filepath, (err, data) => {
                    if (err === null && data.length > 6)
                        Object.assign(this, Object.assign(JSON.parse(data), this));
                    resolve(this);
                });
            }
            else {
                const _this = filesJSON[filepath];
                let numer = _connections.get(_this);
                _connections.set(_this, ++numer);
                resolve(_this);
            }
        });
        console.log(hasRead)
        _hasRead.set(this, hasRead);
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