#!/usr/local/bin/node --harmony_destructuring
"use strict";
const process = require('process');
/* See gist: https://gist.github.com/branneman/8048520 
 * Better local require() paths for Node.js */
process.env.NODE_PATH += ":"+__dirname+"/lib/";
require('module').Module._initPaths();
var util = require('util');
var fs = require('fs');
var PEG = require("pl0node.js");
var semantic = require('./lib/semantic.js');					// Require the semantic module
let semanticFunc = semantic.semantic;								// Import the semantic function
var fileName = process.argv[2] || 'tests/input5.pl0';

const lineNumbers = (input) => {
  let count = 1;
  return input.replace(/^/mg, (x) => { 
      let str = ' '+count++;
      return (str.substr(str.length-2)+' ')
    });
};

fs.readFile(fileName, 'utf8', function (err,input) {
  if (err) {
    return console.log(err);
  }
  console.log(`Processing <***\n${lineNumbers(input)}\n***>`);
  try {
    var r = PEG.parse(input);	// Syntactic phase
    semanticFunc(r);		// Semantic phase
    console.log(util.inspect(r, {depth: null}));	// Show tree
  } catch (e) {
    console.log(`Error at line ${e.startLine}, column ${e.startColumn}. Message: ${e.message}`);
  }
});

