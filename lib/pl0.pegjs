/*
 * PEGjs for a "Pl-0" like language
 * Used in ULL PL Grado de Informática classes
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

program = b:block { b.name = "$main"; b.params = []; return b;}

block = d:declaration* st:st?{
          let constants = [];
          let variables = [];
          let classes = [];
          let functions = [];

          // all declarations
          d.map ((dec) => {
            if (dec.type == 'constantDeclaration') {
              console.log(dec);
              dec.constants.map((c) => {
                constants.push(c);
              });
            }
            else if (dec.type == 'varDeclaration')
              variables.push(v);
            else if (dec.type == 'functionDeclaration')
              functions.push(v);
            else if (dec.type == 'classDeclaration')
              classes.push(v);
          });

          return {
            type: 'Block',
            constants: constants,
            classes: classes,
            variables: variables,
            functions: functions,
            main: st? si : []
          };
      }
      /*
      / cD:constantDeclaration? vD:varDeclaration? clD:classDeclaration? fD:functionDeclaration* st:st
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
                  type: 'constantDeclaration',
                  constants: c
                }
              }
             / v:varDeclaration {
               return {
                 type: 'varDeclaration',
                 variables: v
               }
             }
             / f:functionDeclaration {
               return {
                 type: 'functionDeclaration',
                 functions: f
               }
             }
             / c:classDeclaration {
               return {
                 type: 'classDeclaration',
                 classes: c
               }
             }



constantDeclaration = CONST id:ID ASSIGN n:NUMBER rest:(COMMA ID ASSIGN NUMBER)* SC
                        {
                          let r = rest.map( ([_, id, __, nu]) => [id.value, id.location, nu.value] );
                          return [[id.value, id.location, n.value]].concat(r);
                        }

varDeclaration = VAR id:ID rest:(COMMA ID)* SC
                    {
                      let r = rest.map( ([_, id]) => [id.value, id.location] );
                      return [id.value, id.location].concat(r)
                    }

functionDeclaration = FUNCTION id:ID LEFTPAR !COMMA p1:ID? r:(COMMA ID)* RIGHTPAR SC b:block SC
      {
        let params = p1? [p1] : [];
        params = params.concat(r.map(([_, p]) => p));
        //delete b.type;
        return Object.assign({
          type: 'Function',
          name: id,
          params: params,
        }, b);
      }


classDeclaration = CLASS id:ID IS CL cD:constantDeclaration? vD:varDeclaration? fD:functionDeclaration* CR {
              let constants = cD? cD : [];
              let variables = vD? vd : [];
              let functions = fD? fD : [];
              return {
                type: 'Class',
                id: id,
                constants: constants,
                variables: variables,
                functions: fD
              };
          }


st "name" = CL s1:st? r:(SC st)* SC CR {
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
     / a:assign { return a; }
     / v:varDeclaration { return v; }
     / c:constantDeclaration { return c; }
     / f:functionDeclaration { return f; }



assign = i:ID op:op? ASSIGN e:cond {
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

cond = l:exp op:COMP r:exp { return { type: op, left: l, right: r} }
     / exp


exp    = t:term   r:(ADD term)*   { return tree(t,r); }

term   = pow
        / log
        / sqrt
        / mod
        / f:factor r:(MUL factor)* { return tree(f,r); }


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
// end class

DO       = _ "do" _
RETURN   = _ "return" _
VAR      = _ "var" _
CONST    = _ "const" _
FUNCTION = _ "function" _
ID       = _ id:$([a-zA-Z_][a-zA-Z_0-9]*) _
            {
              return { type: 'ID', value: id, location: location() };
            }
NUMBER   = _ digits:$[0-9]+ _
            {
              return { type: 'NUM', value: parseInt(digits, 10) };
            }
