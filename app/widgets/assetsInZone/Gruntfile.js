/*jslint node: true */
'use strict';

var pkg = require('./package.json');

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
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
          'temp/recentFluxAssets.css': 'recentFluxAssets.less'
        }
      }
    },
    ngtemplates: {
      main: {
        options: {
            module: 'recentFluxAssets'
        },
        src: ['recentFluxAssets.html'],
        dest: 'temp/templates.js'
      }
    },
    cssmin: {
      main: {
        src:['temp/recentFluxAssets.css'],
        dest:'dist/recentFluxAssets.full.min.css'
      }
    },
    concat: {
      main: {
        src: ['recentFluxAssets.js','temp/templates.js'],
        dest: 'temp/recentFluxAssets.full.js'
      }
    },
    ngAnnotate: {
      main: {
        src:'temp/recentFluxAssets.full.js',
        dest: 'dist/recentFluxAssets.full.js'
      }
    },
    uglify: {
      main: {
        options: {
          mangle: false,
          banner: '/*Version: <%= grunt.template.today("yyyy-mm-dd HH:MM") %> */',
          sourceMap: true
        },
        src: 'dist/recentFluxAssets.full.js',
        dest:'dist/recentFluxAssets.full.min.js'
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
