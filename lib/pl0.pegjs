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

block = cD:constantDeclaration? vD:varDeclaration? fD:functionDeclaration* st:st
          {
            let constants = cD? cD : [];
            let variables = vD? vD : [];
            return {
              type: 'BLOCK',
              constants: constants,
              variables: variables,
              functions: fD,
              main: st
            };
          }

constantDeclaration = CONST id:ID ASSIGN n:NUMBER rest:(COMMA ID ASSIGN NUMBER)* SC
                        {
                          let r = rest.map( ([_, id, __, nu]) => [id.value, id.location, nu.value] );
                          return [[id.value, n.value]].concat(r)
                        }

varDeclaration = VAR id:ID rest:(COMMA ID)* SC
                    {
                      let r = rest.map( ([_, id]) => [id.value, id.location] );
                      return [id.value].concat(r)
                    }

functionDeclaration = FUNCTION id:ID LEFTPAR !COMMA p1:ID? r:(COMMA ID)* RIGHTPAR SC b:block SC
      {
        let params = p1? [p1] : [];
        params = params.concat(r.map(([_, p]) => p));
        //delete b.type;
        return Object.assign({
          type: 'FUNCTION',
          name: id,
          params: params,
        }, b);

      }


st    "name" = CL s1:st? r:(SC st)* SC* CR {
               let t = [];
               if (s1) t.push(s1);
               return {
                 type: 'COMPOUND', // Chrome supports destructuring
                 children: t.concat(r.map( ([_, st]) => st ))
               };
            }
       / IF e:assign THEN st:st ELSE sf:st
           {
             return {
               type: 'IFELSE',
               c:  e,
               st: st,
               sf: sf,
             };
           }
       / IF e:assign THEN st:st
           {
             return {
               type: 'IF',
               c:  e,
               st: st
             };
           }
       / WHILE a:assign DO st:st {
             return { type: 'WHILE', c: a, st: st };
           }
       / RETURN a:assign? {
             return { type: 'RETURN', children: a? [a] : [] };
           }
       / assign

assign = i:ID ASSIGN e:cond
            { return {type: '=', left: i, right: e}; }
       / cond

cond = l:exp op:COMP r:exp { return { type: op, left: l, right: r} }
     / exp
     / array

array = BL elem:term? elemN:(COMMA term)* BR
{
  let t = [];
  if (elem) t.push(elem);
  return {
    type: 'ARRAY',
    elements: t.concat(elemN.map(([_, exp]) => exp))
  }
}

exp    = t:term   r:(ADD term)*   { return tree(t,r); }

term   = pow
        / log
        / sqrt
        / mod
        / f:factor r:(MUL factor)* { return tree(f,r); }


pow  = b:factor POW e:factor {
        return {
          type: 'POW',
          base: b,
          exp: e
         }
       }

sqrt  = r:factor SQRT v:factor {
       return {
         type: 'SQRT',
         root: r,
         value: v
        }
      }

log   = b:factor LOG v:factor {
      return {
        type: 'LOG',
        base: b,
        value: v
        }
      }

mod   = v:factor MOD m:factor {
      return {
        type: '%',
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
             type: 'CALL',
             func: f,
             arguments: t.concat(r.map(([_, exp]) => exp))
           }
         }
       / ID
       / LEFTPAR t:assign RIGHTPAR   { return t; }


_ = $[ \t\n\r]*

ASSIGN   = _ op:'=' _  { return op; }
ADD      = _ op:[+-] _ { return op; }
POW      = _ "**" _
SQRT     = _ "//" _
LOG      = _ "!**" _
MOD      = _ "%" _
MUL      = _ op:[*/] _ { return op; }
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
