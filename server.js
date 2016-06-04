#!/usr/local/bin/node --harmony_destructuring
"use strict";

const express = require('express');
const app = express();
const path = require('path');
const fs = require("fs");
const expressLayouts = require('express-ejs-layouts');
const PEG = require("./lib/chuchugrammar.js");
const semantic = require('./lib/semantic.js');						// Require the semantic module
const semanticPhase = semantic.semantic;							// Import the semantic function
const databaseFile = "db/database.db";
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(databaseFile);
var exists = fs.existsSync(databaseFile);

app.set('port', (process.env.PORT || 5000));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
  response.render ('index', { title: "Chuchu++ | Analyzer"} );
});

app.get('/grammar', (request, response) => {
  response.render ('grammar', { title: "Chuchu++ | Grammar"} );
});

app.get('/account', (request, response) => {
  response.render ('account', { title: "Chuchu++ | Account System Information"} );
});

app.get('/codegenerator', (request, response) => {
  response.render ('codegenerator', { title: "Chuchu++ | Code Generator Information"} );
});

// Create SQLite databases if not exists
db.serialize(function() {
  if(!exists) {
    db.run("CREATE TABLE Accounts (name TEXT, password TEXT)");
	db.run("CREATE TABLE Programs (owner TEXT, name TEXT, program TEXT)");
  }

  	db.each("SELECT rowid AS id, name, password FROM Accounts", function(err, row) {
		console.log("info: " + row.name + ", " + row.password);
	});
	// Delete programs and accounts for debugging
	var stmt = db.prepare("DELETE FROM Accounts");
	stmt.run();
	stmt.finalize();

	//stmt = db.prepare("DELETE FROM Programs");
	//stmt.run();
	//stmt.finalize();
	//
});

//

// Database AJAX calls
app.get('/accountExists', (request, response) => {
	var data = request.query.data;
	var result = {};
	db.serialize(function() {
		db.each("SELECT rowid AS id, name, password FROM Accounts WHERE name = " + data.name, function(err, row) {
			result.text = 'yes';
			response.send (result);
		});
	});
});

app.get('/validateCredentials', (request, response) => {
	var data = request.query.data;
	var result = {};
	db.serialize(function() {
		db.all("SELECT rowid AS id, name, password FROM Accounts WHERE name = " + data.name + " AND password = " + data.password, function(err, rows) {
			result.text = 'yes';
			response.send (result);
		});
	});
});

app.get('/createAccount', (request, response) => {
	var data = request.query.data;
	console.log(data);
	db.serialize(function() {
		// Delete
		var stmt = db.prepare("DELETE FROM Accounts WHERE name = ?");
		stmt.run(data.name);
		stmt.finalize();

		stmt = db.prepare("DELETE FROM Programs WHERE owner = ?");
		stmt.run(data.name);
		stmt.finalize();
		//

		// Insert
		stmt = db.prepare("INSERT INTO Accounts VALUES (?, ?)");
		stmt.run(data.name, data.password);
		stmt.finalize();
		//
	});
});

app.get('/getProgram/:nombre', (request, response) => {
	var data = request.query.nombre;
	db.each("SELECT owner, name, program FROM Programs WHERE name = '" + data + "'", function(err, row) {
	    response.json(row.program);
	});
});

app.get('/getProgramsFromUser', (request, response) => {
	var data = request.query.data;
	var programs = [];
	db.each("SELECT name, program FROM Programs WHERE owner = " + data.name, function(err, row) {
			programs.push({ "name": row.name, "program": row.program});
		});
	response.send (programs);
});

app.get('/getAllPrograms', (request, response) => {
	var programs = [];
	db.all("SELECT owner, name, program FROM Programs WHERE owner = 'User'", function(err, rows) {
		rows.forEach(function (row) {
			programs.push(row.name);
        });
		response.json(programs);
	});
});

app.get('/cleanDB', (request, response) => {
    db.serialize(function() {
		// Delete
		var stmt = db.prepare("DELETE FROM Programs");
		stmt.run();
		stmt.finalize();
		//
	});
});

app.get('/addProgram', (request, response) => {
	var data = request.query.data;
	var programs = [];
	db.serialize(function() {
		var stmt = db.prepare("INSERT INTO Programs VALUES (?, ?, ?)");
		//Insert data into DB
		stmt.run(data.owner, data.name, data.program);
		stmt.finalize();
		db.each("SELECT name, program FROM Programs WHERE owner = '" + data.owner + "'", function(err, row) {
			programs.push({"name": row.name, "program": row.program});
			if(programs.length == 1) {
				response.send(programs);
			}
		});
	});
});
//

app.get('/parse', (request, response) => {
	let code = request.query.data;
	let r = PEG.parse(code);	// Syntactic phase
    //console.log(r);
	let s = semanticPhase(r);
	//console.log(s);
	response.send ({ "result": s.data, "status": s.status});
});

app.listen(app.get('port'), () => {
    console.log(`Node app is running at localhost: ${app.get('port')}` );
});
