/* Chuchu++: A multiparadigm meta-language built using PEGjs as parser for the
 * Language Processors subject at Universidad de La Laguna, Grado en Ingeniería Informática.
 *
 * Team: Adrián Rodríguez Bazaga (arodriba@ull.edu.es) & Rudolf Cicko (alu0100824780@ull.edu.es)*
 */

"use strict";
let symbolTables = [{name: "Global", father: null, vars: {}}]; // Global scope symbol table
let currentScope = 0;
let currentSymbolTable = symbolTables[currentScope]; // Current symbol table
let arrayToReturn = {};
let decoratedTree;

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
	let foundSymbol = false;
	let symbolValue;
  	let inScope = getCurrentScope();
  	do {
		if(symbolTables[inScope].vars[identifier] != undefined && symbolTables[inScope].vars[identifier].value == identifier) {
			symbolValue = symbolTables[inScope].vars[identifier]
			foundSymbol = true;
		}
    	inScope--;
  	} while (inScope >= 0 && !foundSymbol);

  	inScope++;
  	return [symbolValue, inScope];
}

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
			arrayToReturn = { "status": "error", "data": "Identifier " + p.value + " already defined. Line: " + p.location.start.line + ", Column: " + p.location.start.column};
			return arrayToReturn;
        }

		currentSymbolTable.vars[p.value] = { type: "PARAM", value: p.value };
	});

	// Add constants identifiers to the current scope
    tree.constants.forEach(function(c) {
		// Save the constant
        //console.log(c[0]);
        if (currentSymbolTable.vars[c]) {
			console.log(c);
			arrayToReturn = { "status": "error", "data": "Constant " + c[0] + " already defined. Line: " + c["start"].line + ", Column: " + c["start"].column};
			return arrayToReturn;
        }

		currentSymbolTable.vars[c[0]] = { type: "CONSTANT", value: c[0] };
	});

	// Add variables identifiers to the current scope
	//console.log(tree.variables);
    tree.variables.forEach(function(v) {
		// Save the variable
        //console.log(v[0]);
        if (currentSymbolTable.vars[v]) {
			//console.log(v);
			arrayToReturn = { "status": "error", "data": "Variable " + v[0] + " already defined. Line: " + v["start"].line + ", Column: " + v["start"].column};
			return arrayToReturn;
        }

		currentSymbolTable.vars[v[0]] = { type: "VAR", value: v[0] };
	});

	// Add functions identifiers to the current scope
    tree.functions.forEach(function(f) {
		// Save the function
        //console.log(f.name.value);
        //console.log(f.type);
        if (currentSymbolTable.vars[f.name.value]) {
			arrayToReturn = { "status": "error", "data": "Function " + f.name.value + " already defined."};
			return arrayToReturn;
        }
        
		currentSymbolTable.vars[f.name.value] = { type: "FUNCTION", value: f.name.value };
	});
	
	
	// Checking for invalid calls
	if(tree.main.type == "Call") {
		let calledFunction = searchForSymbol(tree.main.func.value);
		if(calledFunction[0] == undefined || calledFunction[0].type != "FUNCTION") { // Not exists or is not a function
			//console.log("Function not exists");
			arrayToReturn = { "status": "error", "data": "Called function '" + tree.main.func.value + "' is not defined. Line: " + tree.main.func.location.start.line + ", Column: " + tree.main.func.location.start.column};
			return arrayToReturn;
		}
	}
	//

	//tree.symbolTable = currentSymbolTable;
	//console.log(tree);
};

let semantic = (tree) => {
	decoratedTree = tree;
	let ebp = eachBlockPre(decoratedTree, callbackAction, {})
	if(ebp.status == 'error') {
		return ebp;
	}
	arrayToReturn = { "status": "success", "data": decoratedTree};
	return arrayToReturn;
};
exports.semantic = semantic;

let eachBlockPre = (tree, callbackAction, f) => {
	arrayToReturn = {};
	callbackAction(tree, f);
	if(arrayToReturn.status == 'error') {
		return arrayToReturn;
	}
	tree.functions.map((node) => eachBlockPre(node, callbackAction, f));
	arrayToReturn = { "status": "success", "data": tree};
	return arrayToReturn;
};
