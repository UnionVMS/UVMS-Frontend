/*
﻿Developed with the contribution of the European Commission - Directorate General for Maritime Affairs and Fisheries
© European Union, 2015-2016.

This file is part of the Integrated Fisheries Data Management (IFDM) Suite. The IFDM Suite is free software: you can
redistribute it and/or modify it under the terms of the GNU General Public License as published by the
Free Software Foundation, either version 3 of the License, or any later version. The IFDM Suite is distributed in
the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details. You should have received a
copy of the GNU General Public License along with the IFDM Suite. If not, see <http://www.gnu.org/licenses/>.
 */
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