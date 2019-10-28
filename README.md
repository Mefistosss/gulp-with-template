# gulp-with-template [![Build Status](https://travis-ci.com/Mefistosss/gulp-with-template.svg?branch=master)](https://travis-ci.com/Mefistosss/gulp-with-template)

## Install

```
$ npm install --save gulp-with-template
```

## Usage

using 'requirejs' as an example
### template.js
```js
define(
    '<%-modulename%>',
    <% if (deps && deps.length) { %>
    [
        <% var l = args.length; deps.forEach(function(dep, index) { %>
        '<%-dep%>'<% if (l - 1 !== index) {%>,<% } %>
        <% }); %>
    ],
    <% } %>
    function (
        <% if (args && args.length) {var l = args.length; args.forEach(function(arg, index) { %>
        <%-arg%><% if (l - 1 !== index) {%>,<% } %>
        <% });} %>
    ) {
        <%- content %>
    }
);
````

### module1.js
```js
return function () {
    m2();
    console.log('module1');
};
````

### module2.js
```js
return function () {
    console.log('module2');
};
````

### main.js
```js
require(['module1'], function (m1) {
    m1();
});
````

### gulpfile.js
```js
const path = require('path');
const gulp = require('gulp');
const gulpWithTemplate = require('gulp-with-template');

const templateFilePath = path.join(process.cwd(), 'template.js');

gulp.task('module1', function() {
    return gulp.src(['module1.js'])
        .pipe(gulpWithTemplate(templateFilePath, {
            modulename: 'module1',
            deps: ['module2'],
            args: ['m2']
        }))
        .pipe(gulp.dest('dist'))
});

gulp.task('module2', function() {
    return gulp.src(['module1.js'])
        .pipe(gulpWithTemplate(templateFilePath, {
            modulename: 'module2',
            deps: null,
            args: null
        }))
        .pipe(gulp.dest('dist'))
});


// dynamic
gulp.task('together', function() {
    return gulp.src(['module1.js', 'module2.js'])
        .pipe(gulpWithTemplate(function(file) {
            let options = null;

            if (file.path.indexOf('module1.js') !== -1) {
                options = {
                    modulename: 'module1',
                    deps: ['module2'],
                    args: ['m2']
                };
            } else {
                options = {
                    modulename: 'module2',
                    deps: null,
                    args: null
                };
            }

            return {
                template: templateFilePath,
                // contentName: 'content' // - if you want to change standard content name
                options: options
            };
        }))
        .pipe(gulp.dest('dist'))
});

````

### dist/module1.js
```js
define(
    'module1',
    [
        'module2'
    ],
    function (
        m2
    ) {
        return function () {
            m2();
            console.log('module1');
        };
    }
);
```

### dist/module2.js
```js
define(
    'module2',
    function (
    ) {
        return function () {
            console.log('module2');
        };
    }
);
```

## Tip

You can also change the output by yourself

### gulpfile.js
```js
const path = require('path');
const gulp = require('gulp');
const gulpWithTemplate = require('gulp-with-template');

const templateFilePath = path.join(process.cwd(), 'template.js');

gulp.task('module1', function() {
    return gulp.src(['module1.js'])
        .pipe(gulpWithTemplate(templateFilePath, {
            modulename: 'module1',
            deps: ['module2'],
            args: ['m2']
        }, function(file, content /* String */, _ /* lodash */) {
            // you must return a string
            return _.unescape(content); // for example
        }))
        .pipe(gulp.dest('dist'))
});

gulp.task('module2', function() {
    return gulp.src(['module1.js'])
        .pipe(gulpWithTemplate(templateFilePath, {
            modulename: 'module2',
            deps: null,
            args: null
        }, function(file, content /* String */, _ /* lodash */) {
            // you must return a string
            return _.unescape(content); // for example
        }))
        .pipe(gulp.dest('dist'))
});


// dynamic
gulp.task('together', function() {
    return gulp.src(['module1.js', 'module2.js'])
        .pipe(gulpWithTemplate(function(file) {
            let options = null;

            if (file.path.indexOf('module1.js') !== -1) {
                options = {
                    modulename: 'module1',
                    deps: ['module2'],
                    args: ['m2']
                };
            } else {
                options = {
                    modulename: 'module2',
                    deps: null,
                    args: null
                };
            }

            return {
                template: templateFilePath,
                // contentName: 'content' // - if you want to change standard content name
                options: options
            };
        }, function(file, content /* String */, _ /* lodash */) {
            // you must return a string
            return _.unescape(content); // for example
        }))
        .pipe(gulp.dest('dist'))
});

```