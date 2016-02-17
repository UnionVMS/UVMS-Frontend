/*jslint node: true */
'use strict';

var pkg = require('./package.json');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      before:{
        src:['dist','temp']
      },
      after: {
        src:['temp']
      }
    },
    jshint: {
      main: {
        src: ['*.js']
      }
    },
    less: {
      dist: {
        files: {
          'temp/<%=pkg.name%>.css': '<%=pkg.name%>.less'
        }
      }
    },
    ngtemplates: {
      main: {
        options: {
            module: '<%=pkg.name%>'
        },
        src: ['<%=pkg.name%>.html'],
        dest: 'temp/templates.js'
      }
    },
    cssmin: {
      main: {
        src:['temp/<%=pkg.name%>.css'],
        dest:'dist/<%=pkg.name%>.full.min.css'
      }
    },
    concat: {
      main: {
        src: ['<%=pkg.name%>.js','temp/templates.js'],
        dest: 'temp/<%=pkg.name%>.full.js'
      }
    },
    ngAnnotate: {
      main: {
        src:'temp/<%=pkg.name%>.full.js',
        dest: 'dist/<%=pkg.name%>.full.js'
      }
    },
    uglify: {
      main: {
        options: {
          mangle: false,
          banner: '/*Version: <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */',
          sourceMap: true
        },
        src: 'dist/<%=pkg.name%>.full.js',
        dest:'dist/<%=pkg.name%>.full.min.js'
      }
    },
  });

  // Task to build a distribution
  grunt.registerTask('dist', [
    'clean:before', // remove dist, temp
    'jshint',       // run JSHint
    'less',         // compile less file
    'ngtemplates',  // create template cache from html
    'cssmin',       // minify css
    'concat',       // concat javascripts
    'ngAnnotate',   // annotate
    'uglify',       // uglify javascript
    'clean:after'   // remove temp directory
  ]);

};
