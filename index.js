"use strict";
const fs = require("fs");
const filesJSON = {};
const _filepath = new WeakMap();
const _connections = new WeakMap();
module.exports = class FileJSON {
    constructor(filepath) {
        return new Promise((resolve, reject) => {
            if (filesJSON[filepath] instanceof FileJSON === false) {
                filesJSON[filepath] = this;
                _filepath.set(this, filepath);
                _connections.set(this, 1);
                fs.readFile(filepath, (err, data) => {
                    if (err === null)
                        Object.assign(this, JSON.parse(data));
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
    }
    write() {
        return new Promise((resolve, reject) => {
            fs.writeFile(_filepath.get(this), JSON.stringify(this), err => {
                err === null ? resolve("done") : reject();
            });
        });
    }
    close() {
        let number = _connections.get(this);
        if (--number === 0)
            delete (filesJSON[_filepath.get(this)]);
        _connections.set(this, number);
    }
};