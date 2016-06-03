/*
 * PEGjs for Chuchu++
 * By Adrian Rodriguez Bazaga & Rudolf Cicko
 */

{
  var tree = function(f, r) {
    if (r.length > 0) {
      var last = r.pop();
      var result = {
        type:  last[0],
        left: tree(f, r),
        right: last[1]
      };
    }
    else {
      var result = f;
    }
    return result;
  }
}

program = b:block {
    console.log("PROGRAM");
    b.name = "$main";
    b.params = [];
    return b;
  }

block = d:(declaration)* st:st?{
          let declarations = [];
          console.log("BLOCK");
          console.log(st);
          console.log("END ST");
          // Liberación del switch little smell. Inicializamos arrays vacíos de cada tipo de declaración.
          declarations["constantDeclaration"] = [];
          declarations["varDeclaration"] = [];
          declarations["functionDeclaration"] = [];
          declarations["classDeclaration"] = [];
          declarations["objectDeclaration"] = [];

          d.map ((dec) => {
            declarations[dec.type].push(dec.value); // dec --> declaration.  dec.value is the sentence of the declaration.
          })

          return {
            type: 'Block',
            constants: declarations["constantDeclaration"],
            classes:   declarations["classDeclaration"],
            variables: declarations["varDeclaration"],
            object:    declarations["objectDeclaration"],
            functions: declarations["functionDeclaration"],
            main: st? st : []
          };
      }
/*      / cD:constantDeclaration? vD:varDeclaration? clD:classDeclaration? fD:functionDeclaration* st:st
          {
            let constants = cD? cD : [];
            let variables = vD? vD : [];
            let classes = clD? clD : [];
            return {
              type: 'Block',
              constants: constants,
              classes: classes,
              variables: variables,
              functions: fD,
              main: st
            };
          }
*/

declaration = c:constantDeclaration {
                return {
                  type: "constantDeclaration",
                  value: c
                }
              }
             / v:varDeclaration {
               return {
                 type: "varDeclaration",
                 value: v
               }
             }
             / f:functionDeclaration {
               return {
                 type: "functionDeclaration",
                 value: f
               }
             }
             / c:classDeclaration {
               return {
                 type: "classDeclaration",
                 value: c
               }
             }
             / o:objectDeclaration {
               return {
                 type: "objectDeclaration",
                 value: o
               }
             }



constantDeclaration = CONST id:ID ASSIGN n:NUMBER SC {
                        console.log("constant declaration");
                          return {
                            id: id.value,
                            location: id.location,
                            value: n.value
                          }
                        }

varDeclaration = VAR id:ID SC {
                    console.log("variable declaration");
                      return {
                        id: id.value,
                        location: id.location
                      }
                    }

functionDeclaration = FUNCTION id:ID LEFTPAR !COMMA p1:ID? r:(COMMA ID)* RIGHTPAR b:st {
              let params = p1? [p1] : [];
              params = params.concat(r.map(([_, p]) => p));
              console.log("Function declaration");

              return {
                type: 'Function',
                name: id,
                params: params,
                nParams: params.size,
                block: b
              }
/*
        return Object.assign({
          type: 'Function',
          name: id,
          params: params,
          nParams: params.size
        }, b);
*/
      }

objectDeclaration = OBJECT id:ID AS cl:ID SC {
              return {
                type: "ObjectDeclaration",
                id: id,
                class: cl
              }
            }


classDeclaration = CLASS id:ID IS CL d:declaration* CR SC {
            let declarations = [];

            declarations["constantDeclaration"] = [];
            declarations["varDeclaration"]      = [];
            declarations["functionDeclaration"] = [];
            declarations["objectDeclaration"]   = [];
            declarations["classDeclaration"]    = [];

            d.map ((dec) => {
              declarations[dec.type].push(dec.value);
            })

            return {
              type: 'Class',
              id: id,
              constants: declarations["constantDeclaration"],
              classes:   declarations["classDeclaration"],
              variables: declarations["varDeclaration"],
              objects:   declarations["objectDeclaration"],
              functions: declarations["functionDeclaration"]
            };
          }



st "name" = CL s1:st? r:(SC st)* SC? CR {
             console.log("Compound sentence");
             let t = [];
             if (s1) t.push(s1);
             return {
               type: 'Compound', // Chrome supports destructuring
               children: t.concat(r.map( ([_, st]) => st ))
             };
        }
        / IF e:assign THEN st:st ELSE sf:st
           {
             return {
               type: 'IfElse',
               c:  e,
               st: st,
               sf: sf,
             };
           }
       / IF e:assign THEN st:st
           {
             return {
               type: 'If',
               c:  e,
               st: st
             };
           }
       / WHILE a:assign DO st:st {
             return { type: 'While', c: a, st: st };
           }
       / ITERATE n:factor TIMES st:st {
             return {
               type: 'Iterate',
               times: n,
               st: st
             }
       }
       / SWITCH LEFTPAR id:ID RIGHTPAR CL cases:(CASE n:NUMBER st:st)+ DEFAULT defaul:st CR {
         return {
           type: 'Switch',
           id: id,
           cases: cases,
           defaul: defaul
         }
       }
       / PUT factor:factor INTO factor2:factor n:NEGATE? sort:SORTED? {
         let options = [];
         if (sort) {
           if (n) {
             options.push("inverse sort");
           }
           else {
             options.push("sort");
           }
         }
         return  {
           type: "Put",
           input: factor,
           destination: factor2,
           options: options
         }
       }
       / RETURN a:assign? {
             return { type: 'Return', children: a? [a] : [] };
           }
       / a:assign {
         console.log("assign as sentence.");
         return a;
        }
       / v:varDeclaration { return v; }
       / c:constantDeclaration { return c; }
       / f:functionDeclaration { return f; }
       / o:objectDeclaration { return  o; }



assign = i:ID ASSIGN func:anonFunct {
          return {
              type: 'Assign',
              left: i,
              right: func
            }
          }
      / i:ID op:op? ASSIGN e:cond {
         var right;

         if (op) {
            right = {
               type: op,
               left: i,
               right: e
             }
         }
         else {
            right = e;
         }
         return {
            type: 'Assign',
            left: i,
            right: right
          };
      }
      / cond


anonFunct = FUNCTION LEFTPAR !COMMA p1:ID? r:(COMMA ID)* RIGHTPAR CL b:block CR {
        let params = p1? [p1] : [];
        params = params.concat(r.map(([_, p]) => p));

        return Object.assign({
          type: 'AnonymFunction',
          params: params,
          nParams: params.size
        }, b);
      }



cond = l:exp op:COMP r:exp { return { type: op, left: l, right: r} }
     / arrayOp
     / exp


arrayOp = left:(ID / array) CONCAT right:(ID / array) {
            return {
              type: 'Concat',
              left: left,
              right: right
            }
          }


exp    = t:term   r:(ADD term)*   { return tree(t,r); }

term   = array
        / concat
        / pow
        / log
        / sqrt
        / mod
        / f:factor r:(MUL factor)* { return tree(f,r); }


concat = a1:factor CONCAT a2:factor {
          return {
            type: 'Concat',
            left: a1,
            right: a2
          }
        }

pow  = b:factor POW e:factor {
        return {
          type: 'Pow',
          base: b,
          exp: e
         }
       }

sqrt  = r:factor SQRT v:factor {
       return {
         type: 'Sqrt',
         root: r,
         value: v
        }
      }

log   = b:factor LOG v:factor {
      return {
        type: 'Log',
        base: b,
        value: v
        }
      }

mod   = v:factor MOD m:factor {
      return {
        type: 'Modulus',
        value: v,
        mod: m
        }
      }



factor = NUMBER
       / f:ID LEFTPAR a:assign? r:(COMMA assign)* RIGHTPAR
         {
           let t = [];
           if (a) t.push(a);
           return {
             type: 'Call',
             func: f,
             arguments: t.concat(r.map(([_, exp]) => exp))
           }
         }
       / ArrayElement
       / ID
       / LEFTPAR t:assign RIGHTPAR   { return t; }
       / array


array = BL elem:term? elemN:(COMMA term)* BR
{
 let t = [];
 let nParams;
 if (elem) t.push(elem);
 return {
   type: 'Array',
   elements: t.concat(elemN.map(([_, exp]) => exp)),
   size: elemN.length + 1
 }
}

ArrayElement = id:ID BL inx:exp BR {
      return {
        type: 'ArrayElement',
        id: id,
        index: inx
      }
    }


op = ADD / MUL / POW / SQRT

_ = $[ \t\n\r]*

ASSIGN   = _ op:'=' _  { return op; }
ADD      = _ op:[+-] _ { return op; }
MUL     = _ op:[*/] _ { return op; }
POW      = _ "**" _
SQRT     = _ "//" _
LOG      = _ "!**" _
NEGATE   = _ "!" _
MOD      = _ "%" _
LEFTPAR  = _"("_
RIGHTPAR = _")"_
CL       = _"{"_
CR       = _"}"_
BL       = _"["_
BR       = _"]"_
SC       = _";"+_
COMMA    = _","_
COMP     = _ op:("=="/"!="/"<="/">="/"<"/">") _ {
               return op;
            }
IF       = _ "if" _
THEN     = _ "then" _
ELSE     = _ "else" _
WHILE    = _ "while" _

// iterate function
ITERATE  = _ "iterate" _
TIMES    = _ "times" _
// end iterate function

// put method
PUT      = _ "put" _
INTO     = _ "into" _
SORTED   = _ "sorted" _
// end put method

// class
CLASS    = _ "class" _
IS       = _ "is" _
OBJECT   = _ "object" _
AS       = _ "as" _
// end class

// Array Operations
CONCAT   = _ "concat" _
// end array ops.

// SWITCH
SWITCH   = _ "switch" _
CASE     = _ "case" _
BREAK    = _ "break" _
DEFAULT  = _ "default" _
// END SWITCH

DO       = _ "do" _
RETURN   = _ "return" _
VAR      = _ "var" _
CONST    = _ "const" _
FUNCTION = _ "function" _
ID       = _ id:$([a-zA-Z_][a-zA-Z_0-9]*) _
            {
              console.log("NEW ID --> " + id);
              return { type: 'ID', value: id, location: location() };
            }
NUMBER   = _ digits:$[0-9]+ _
            {
              return { type: 'NUM', value: parseInt(digits, 10) };
            }
