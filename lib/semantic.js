/* Chuchu++: A multiparadigm meta-language built using PEGjs as parser for the
 * Language Processors subject at Universidad de La Laguna, Grado en Ingeniería Informática.
 * 
 * Team: Adrián Rodríguez Bazaga (arodriba@ull.edu.es) & Rudolf Cicko * 
 */

"use strict";
let symbolTables = [{name: "Global", father: null, vars: {}}]; // Global scope symbol table 
let currentScope = 0;
let currentSymbolTable = symbolTables[currentScope]; // Current symbol table

function getCurrentScope() {
	return currentScope;
}

function getPreviousScope() {
	currentScope--;
   	currentSymbolTable = symbolTables[getCurrentScope()];
}

function createScope(identifier) { // Used in each function declaration
	currentScope++;
	symbolTables[currentScope] =  { name: identifier, father: currentSymbolTable, vars: {} };
	currentSymbolTable.vars[identifier].symbolTable = symbolTables[getCurrentScope()];
	currentSymbolTable = symbolTables[getCurrentScope()];      
	return currentSymbolTable;
}

function searchForSymbol(identifier) {
	var foundSymbol;
  	var inScope = getCurrentScope();
  	do {
		foundSymbol = symbolTables[s].vars[identifier];
    	inScope--;
  	} while (inScope >= 0 && !foundSymbol);
  	
  	inScope++;
  	return [foundSymbol, inScope];
}

function SemanticException(message, line, column) {
    this.name = 'SemanticException';
    this.message = message;
    this.startLine = line;
    this.startColumn = column;
    this.stack = (new Error()).stack;
}
SemanticException.prototype = new Error;   // This is my custom Error class for Semantic Exceptions
                                
let callbackAction = (tree, args) => {        
    let funcName;
	if(getCurrentScope() == 0) {
		currentSymbolTable.vars[tree.name] = { type: "FUNCTION", name: tree.name, value: tree.params.length };
		funcName = tree.name;
	} else {
		currentSymbolTable.vars[tree.name.value] = { type: "FUNCTION", name: tree.name.value, value: tree.params.length };
		funcName = tree.name.value;
	}
	
	createScope(funcName);
	// Add function parameters to the current scope
    tree.params.forEach(function(p) {
		// Save the parameter
        //console.log(p.value);
        if (currentSymbolTable.vars[p.value]) {
			throw new SemanticException("Identifier " + p.value + " already defined.", p.location.start.line, p.location.start.column);
        }
            
		currentSymbolTable.vars[p.value] = { type: "PARAM", value: "" };
	});
	
	// Add constants identifiers to the current scope
    tree.constants.forEach(function(c) {
		// Save the constant
        //console.log(c[0]);
        if (currentSymbolTable.vars[c[0]]) {
			//console.log(c[1]);
			throw new SemanticException("Constant " + c[0] + " already defined.", c[1].start.line, c[1].start.column);
        }
            
		currentSymbolTable.vars[c[0]] = { type: "CONSTANT", value: "" };
	});
	
	// Add variables identifiers to the current scope
    tree.variables.forEach(function(v) {
		// Save the variable
        //console.log(v[0]);
        if (currentSymbolTable.vars[v[0]]) {
			throw new SemanticException("Variable " + v[0] + " already defined.", v[1].start.line, v[1].start.column);
        }
            
		currentSymbolTable.vars[v[0]] = { type: "VAR", value: "" };
	});
	
	// Add functions identifiers to the current scope
    tree.functions.forEach(function(f) {
		// Save the function
        //console.log(f.name.value);
        if (currentSymbolTable.vars[f.name.value]) {
			throw new Error("Function " + f.name.value + " already defined.");
        }
            
		currentSymbolTable.vars[f.name.value] = { type: "FUNCTION", value: "" };
	});
	
	//tree.symbolTable = currentSymbolTable;
	
	//console.log(tree);
};

let semantic = (tree) => { eachBlockPre(tree, callbackAction, {}) };
exports.semantic = semantic;

let eachBlockPre = (tree, callbackAction, f) => {
	callbackAction(tree, f);
	tree.functions.map((node) => eachBlockPre(node, callbackAction, f));
};
