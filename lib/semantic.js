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
	if (tree.params) {
		tree.params.forEach(function(p) {
			if (currentSymbolTable.vars[p.value]) {
				arrayToReturn = { "status": "error", "data": "Identifier " + p.value + " already defined. Line: " + p.location.start.line + ", Column: " + p.location.start.column};
				return arrayToReturn;
			}
			currentSymbolTable.vars[p.value] = { type: "PARAM", value: p.value };
		});
	}

	if (tree.constants) {
	    tree.constants.forEach(function(c) {
	        if (currentSymbolTable.vars[c]) {
				console.log(c);
				arrayToReturn = { "status": "error", "data": "Constant " + c[0] + " already defined. Line: " + c["start"].line + ", Column: " + c["start"].column};
				return arrayToReturn;
	        }
			currentSymbolTable.vars[c[0]] = { type: "CONSTANT", value: c[0] };
		});
	}

	// Add variables identifiers to the current scope
	if (tree.variables) {
		tree.variables.forEach(function(v) {
			if (currentSymbolTable.vars[v]) {
				arrayToReturn = { "status": "error", "data": "Variable " + v[0] + " already defined. Line: " + v["start"].line + ", Column: " + v["start"].column};
				return arrayToReturn;
			}
			currentSymbolTable.vars[v[0]] = { type: "VAR", value: v[0] };
		});
	}
	
	// Add functions identifiers to the current scope
	if (tree.functions) {
		tree.functions.forEach(function(f) {
			if (currentSymbolTable.vars[f.name.value]) {
				arrayToReturn = { "status": "error", "data": "Function " + f.name.value + " already defined."};
				return arrayToReturn;
			}
			currentSymbolTable.vars[f.name.value] = { type: "FUNCTION", value: f.name.value, arguments: f.params};
		});
	}


	// Checking for invalid calls in ONE LINE programs
	if (tree.main) {
		if(tree.main.type == "Call") {
			// First: if using IDs, do they exist?
			tree.main.arguments.forEach(function(arg) {
				if(arg.type == "ID") {
					let usedArgIdentifier = searchForSymbol(arg.value);
					if(usedArgIdentifier[0] == undefined) { // Not exists (not declared)
						arrayToReturn = { "status": "error", "data": "Used argument " + arg.value + " in function '" + tree.main.func.value + "' is not defined. Line: " + tree.main.func.location.start.line + ", Column: " + tree.main.func.location.start.column};
						return arrayToReturn;
					} else if (usedArgIdentifier[1] > getCurrentScope()) { // Not in scope
						arrayToReturn = { "status": "error", "data": "Used argument '" + arg.value + "' in function '" + tree.main.func.value + "' is not available in this scope. Line: " + tree.main.func.location.start.line + ", Column: " + tree.main.func.location.start.column};
						return arrayToReturn;
					}
				}
			});
			//

			// Second: is the call valid (Function exists, function is in scope...)?
			let calledFunction = searchForSymbol(tree.main.func.value);
			if(calledFunction[0] == undefined || calledFunction[0].type != "FUNCTION") { // Not exists or is not a function
				arrayToReturn = { "status": "error", "data": "Called function '" + tree.main.func.value + "' is not defined. Line: " + tree.main.func.location.start.line + ", Column: " + tree.main.func.location.start.column};
				return arrayToReturn;
			} else if (calledFunction[1] > getCurrentScope()) { // Not in scope
				arrayToReturn = { "status": "error", "data": "Called function '" + tree.main.func.value + "' is not available in this scope. Line: " + tree.main.func.location.start.line + ", Column: " + tree.main.func.location.start.column};
				return arrayToReturn;
			} else if(tree.main.arguments.length != calledFunction[0].arguments.length) { // Wrong number of parameters
				arrayToReturn = { "status": "error", "data": "Wrong number of arguments calling function '" + tree.main.func.value + "'. Expected: " + calledFunction[0].arguments.length + ", Given: " + tree.main.arguments.length + ". Line: " + tree.main.func.location.start.line + ", Column: " + tree.main.func.location.start.column};
				return arrayToReturn;
			}
			//
		} else if(tree.main.type == "Assign") {
			let rightSide = tree.main.right;
			let usedAssignID;
			if(rightSide.left != undefined && rightSide.left.type == "ID") {
				usedAssignID = searchForSymbol(rightSide.left.value);
				if(usedAssignID[0] == undefined) { // Not exists (not declared)
					arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.left.value + "' in assign for '" + tree.main.left.value + "' is not defined. Line: " + tree.main.left.location.start.line + ", Column: " + tree.main.left.location.start.column};
					return arrayToReturn;
				} else if (usedAssignID[1] > getCurrentScope()) { // Not in scope
					arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.left.value + "' in assign for '" + tree.main.left.value + "' is not available in this scope. Line: " + tree.main.left.location.start.line + ", Column: " + tree.main.left.location.start.column};
					return arrayToReturn;
				}
			}
			if(rightSide.right != undefined && rightSide.right.type == "ID") {
				usedAssignID = searchForSymbol(rightSide.right.value);
				if(usedAssignID[0] == undefined) { // Not exists (not declared)
					arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.right.value + "' in assign for '" + tree.main.left.value + "' is not defined. Line: " + tree.main.left.location.start.line + ", Column: " + tree.main.left.location.start.column};
					return arrayToReturn;
				} else if (usedAssignID[1] > getCurrentScope()) { // Not in scope
					arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.right.value + "' in assign for '" + tree.main.left.value + "' is not available in this scope. Line: " + tree.main.left.location.start.line + ", Column: " + tree.main.left.location.start.column};
					return arrayToReturn;
				}
			}
		} else if(tree.main.type == "Compound") {    // Multiline Programs
			// Search for children
			tree.main.children.forEach(function(child) {
				// START COMPOUND CALLS PART
				if(child.type == "Call") {
					// First: if using IDs, do they exist?
					child.arguments.forEach(function(arg) {
						if(arg.type == "ID") {
							let usedArgIdentifier = searchForSymbol(arg.value);
							if(usedArgIdentifier[0] == undefined) { // Not exists (not declared)
								arrayToReturn = { "status": "error", "data": "Used argument " + arg.value + " in function '" + child.func.value + "' is not defined. Line: " + child.func.location.start.line + ", Column: " + child.func.location.start.column};
								return arrayToReturn;
							} else if (usedArgIdentifier[1] > getCurrentScope()) { // Not in scope
								arrayToReturn = { "status": "error", "data": "Used argument '" + arg.value + "' in function '" + child.func.value + "' is not available in this scope. Line: " + child.func.location.start.line + ", Column: " + child.func.location.start.column};
								return arrayToReturn;
							}
						}
					});
		
					// Second: is the call valid (Function exists, function is in scope...)?
					let calledFunction = searchForSymbol(child.func.value);
					if(calledFunction[0] == undefined || calledFunction[0].type != "FUNCTION") { // Not exists or is not a function
						arrayToReturn = { "status": "error", "data": "Called function '" + child.func.value + "' is not defined. Line: " + child.func.location.start.line + ", Column: " + child.func.location.start.column};
						return arrayToReturn;
					} else if (calledFunction[1] > getCurrentScope()) { // Not in scope
						arrayToReturn = { "status": "error", "data": "Called function '" + child.func.value + "' is not available in this scope. Line: " + child.func.location.start.line + ", Column: " + child.func.location.start.column};
						return arrayToReturn;
					} else if(child.arguments.length != calledFunction[0].arguments.length) { // Wrong number of parameters
						arrayToReturn = { "status": "error", "data": "Wrong number of arguments calling function '" + child.func.value + "'. Expected: " + calledFunction[0].arguments.length + ", Given: " + child.arguments.length + ". Line: " + child.func.location.start.line + ", Column: " + child.func.location.start.column};
						return arrayToReturn;
					}
				// END COMPOUND CALLS PART	
				// START COMPOUND ASSIGN PART
				} else if(child.type == "Assign") {
					let rightSide = child.right;
					let usedAssignID;
					// Save the value in the symbol table (Compound special case)
					currentSymbolTable.vars[child.left.value] = { type: "VAR", value: child.left.value };
					//
					if(rightSide.left != undefined && rightSide.left.type == "ID") {
						usedAssignID = searchForSymbol(rightSide.left.value);
						if(usedAssignID[0] == undefined) { // Not exists (not declared)
							arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.left.value + "' in assign for '" + child.left.value + "' is not defined. Line: " + child.left.location.start.line + ", Column: " + child.left.location.start.column};
							return arrayToReturn;
						} else if (usedAssignID[1] > getCurrentScope()) { // Not in scope
							arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.left.value + "' in assign for '" + child.left.value + "' is not available in this scope. Line: " + child.left.location.start.line + ", Column: " + child.left.location.start.column};
							return arrayToReturn;
						}
					}
					if(rightSide.right != undefined && rightSide.right.type == "ID") {
						usedAssignID = searchForSymbol(rightSide.right.value);
						if(usedAssignID[0] == undefined) { // Not exists (not declared)
							arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.right.value + "' in assign for '" + child.left.value + "' is not defined. Line: " + child.left.location.start.line + ", Column: " + child.left.location.start.column};
							return arrayToReturn;
						} else if (usedAssignID[1] > getCurrentScope()) { // Not in scope
							arrayToReturn = { "status": "error", "data": "Used ID '" + rightSide.right.value + "' in assign for '" + child.left.value + "' is not available in this scope. Line: " + child.left.location.start.line + ", Column: " + child.left.location.start.column};
							return arrayToReturn;
						}
					}
				//END COMPOUND ASSIGN PART
				}
			});
		}
	}

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
	if (tree.functions)
	tree.functions.map((node) => eachBlockPre(node, callbackAction, f));
	arrayToReturn = { "status": "success", "data": tree};
	return arrayToReturn;
};
