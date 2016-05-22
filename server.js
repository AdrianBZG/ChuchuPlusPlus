#!/usr/local/bin/node --harmony_destructuring
"use strict";

const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const PEG = require("./lib/pl0node.js");
const semantic = require('./lib/semantic.js');						// Require the semantic module
const semanticPhase = semantic.semantic;							// Import the semantic function

app.set('port', (process.env.PORT || 5000));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
  response.render ('index', { title: "Chuchu++"} );
});

app.get('/grammar', (request, response) => {
  response.render ('grammar', { title: "Chuchu++"} );
});

app.get('/parse', (request, response) => {
	var code = request.query.data;
	try {
		var r = PEG.parse(code);	// Syntactic phase
		try {
			semanticPhase(r);			// Semantic phase
		} catch (e) {
			// Catch a semantic error
			response.send ({ "result": e, "status": 2});
		}
		//console.log(util.inspect(r, {depth: null}));	// Show tree
		response.send ({ "result": r, "status": 0});
	} catch (e) {
		// Catch a syntactic error
		response.send ({ "result": e, "status": 1});
	}
});

app.listen(app.get('port'), () => {
    console.log(`Node app is running at localhost: ${app.get('port')}` );
});
