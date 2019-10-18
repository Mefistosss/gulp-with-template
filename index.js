/* global Buffer */
/* global module */
/* global require */

'use strict';

const fs = require('fs');
const through = require('through2');
const PluginError = require('plugin-error');
const _ = require('lodash');

const PLUGIN_NAME = require('./package.json').name;

const getTemplateFileContent = (templateFile, callback) => {
    if (templateFile && (typeof templateFile) === 'string') {
        fs.readFile(templateFile, (err, data) => {
            if (err) {
                callback(err);
            } else {
                data = data.toString();
                callback(null, data);
            }
        });
    } else {
        callback(new PluginError(PLUGIN_NAME, 'Template file does not exist.'));
    }
};

module.exports = (templateFile, options, resultCallback) => {
    return through.obj((file, enc, callback) => {
        let contentName = 'content';
        let defaultOptions = {};

        if (file.isNull()) {
            callback(null, file);
            return;
        }

        if (file.isStream()) {
            callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return;
        }

        try {
            if (options) {
                if ((typeof options) === 'function') {
                    resultCallback = options;
                    options = null;
                } else {
                    defaultOptions = JSON.parse(JSON.stringify(options));
                }
            }
        } catch (e) {
            callback(new PluginError(PLUGIN_NAME, e));
        }

        try {
            if ((typeof templateFile) === 'function') {
                const opt = templateFile(file);

                if (opt) {
                    if (opt.options) {
                        defaultOptions = JSON.parse(JSON.stringify(opt.options));
                    }

                    templateFile = opt.template;
                }
            }
        } catch (e) {
            callback(new PluginError(PLUGIN_NAME, e));
        }

        if (defaultOptions && defaultOptions.contentName) {
            contentName = defaultOptions.contentName;
            delete defaultOptions.contentName;
        }

        getTemplateFileContent(templateFile, (err, result) => {
            if (err) {
                callback(err);
            } else {
                try {
                    if (!options) { options = defaultOptions; }
                    let content = file.contents.toString();
                    options[contentName] = content;

                    const tpl = _.template(result);
                    content = tpl(options);
                    if ((typeof resultCallback) === 'function') {
                        content = resultCallback(file, content, _);
                    }

                    file.contents = Buffer.from(content);

                    callback(null, file);
                } catch (e) {
                    callback(new PluginError(PLUGIN_NAME, e.message));
                }
            }
        });
    });
};
