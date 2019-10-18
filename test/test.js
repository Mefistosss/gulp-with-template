'use strict';
/* eslint-env mocha */

const path = require('path');
const assert = require('assert');
const Vinyl = require('vinyl');
const gulpWithTemplate = require('../');

describe('gulp-with-template', () => {
    const templatePath = path.join(process.cwd(), 'test', 'template.js');
    const templatePath2 = path.join(process.cwd(), 'test', 'template2.js');
    const fakeFile = {
        path: path.join(process.cwd(), 'test', 'module.js'),
        contents: Buffer.from('function () { return \'module\'; }')
    };
    const options = {
        contentName: 'content',
        nameOfModule: 'module'
    };

    const result = 'var module = function() {\n    return function () { return \'module\'; };\n};';

    it('should make module', (done) => {
        const s = gulpWithTemplate(templatePath, options);

        s.on('data', (actualFile) => {
            assert.ok(actualFile)
            assert.ok(actualFile.path);
            assert.ok(actualFile.contents);
            assert.equal(actualFile.contents.toString(), result);
            done();
        });

        s.write(new Vinyl(fakeFile));
        s.end();
    });

    it('should make module with callback function', (done) => {
        const s = gulpWithTemplate((file) => {
            if (file.path === fakeFile.path) {
                return {
                    template: templatePath,
                    options: {
                        contentName: 'content',
                        nameOfModule: 'module'
                    }
                };
            }
        });

        s.on('data', (actualFile) => {
            assert.ok(actualFile)
            assert.ok(actualFile.path);
            assert.ok(actualFile.contents);
            assert.equal(actualFile.contents.toString(), result);
            done();
        });

        s.write(new Vinyl(fakeFile));
        s.end();
    });

    it('should make module with result callback function', (done) => {
        const s = gulpWithTemplate(templatePath2, options, (file, content, _) => { return _.unescape(content); });

        s.on('data', (actualFile) => {
            assert.ok(actualFile)
            assert.ok(actualFile.path);
            assert.ok(actualFile.contents);
            assert.equal(actualFile.contents.toString(), result);
            done();
        });

        s.write(new Vinyl(fakeFile));
        s.end();
    });


        it('should make module with callback and result callback function and unescape module', (done) => {
        const s = gulpWithTemplate((file) => {
            if (file.path === fakeFile.path) {
                return {
                    template: templatePath2,
                    options: {
                        contentName: 'content',
                        nameOfModule: 'module'
                    }
                };
            }
        }, (file, content, _) => {
            return _.unescape(content);
        });

        s.on('data', (actualFile) => {
            assert.ok(actualFile)
            assert.ok(actualFile.path);
            assert.ok(actualFile.contents);
            assert.equal(actualFile.contents.toString(), result);
            done();
        });

        s.write(new Vinyl(fakeFile));
        s.end();
    });
});
