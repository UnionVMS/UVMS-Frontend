npm install -g grunt-cli yo bower
bower install
npm install

npm install -g generator-cg-angular
yo cg-angular (do not overwrite)



FIX:
======================================
If error when running npm install:
...
npm ERR! phantomjs@1.9.15 install: `node install.js`
npm ERR! Exit status 1
...

Go to
C:\Users\[user]\AppData\Local\Temp
and rename or remove phantomjs folder.

more info
https://github.com/Medium/phantomjs/issues/284

1.