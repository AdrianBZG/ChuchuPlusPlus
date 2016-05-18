/* Chuchu++: A multiparadigm meta-language built using PEGjs as parser for the
 * Language Processors subject at Universidad de La Laguna, Grado en Ingeniería Informática.
 * 
 * Team: Adrián Rodríguez Bazaga (arodriba@ull.edu.es) & Rudolf Cicko * 
 */

#!/usr/local/bin/node --harmony_destructuring
"use strict";
const process = require('process');
process.env.NODE_PATH += ":"+__dirname+"/lib/";
require('module').Module._initPaths();
var util = require('util');
var fs = require('fs');
var PEG = require("pl0node.js");
var semantic = require('./lib/semantic.js');						// Require the semantic module
let semanticPhase = semantic.semantic;								// Import the semantic function
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
    semanticPhase(r);			// Semantic phase
    console.log(util.inspect(r, {depth: null}));	// Show tree
  } catch (e) {
	// Catch the error and show the information about it (Usually from the semantic phase)
    console.log(`Error at line ${e.startLine}, column ${e.startColumn}. Message: ${e.message}`);
  }
});

