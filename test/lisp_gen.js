var jsc = require('jsverify'),
    generator = jsc.generator,
    shrink = jsc.shrink

// lisp AST uses 4 types:
//  number literals: number
//  string literals: string
//  symbol literals: {sym: "sym-name"}
//  s-expression: array

// We provide 3 functions to jsverify to create an "arbitrary lisp"
//  generate => size: nat -> lisp
//  show => lisp -> string
//  shrink => lisp -> [lisp]

// type symbol = {sym: "name"}
// type lisp = number | string | symbol | [lisp]

/**
 - `generatorNEArray1(gen0: generator a, gen: generator a): generator (array a)`
 * Generate a non-empty array with a unique generator for first element
 */
function generateNEArray1(gen0, gen) {
    return generator.bless(function (size) {
        var arrsize = jsc.random(1, Math.max(logsize(size), 1));
        var arr = new Array(arrsize);
        arr[0] = gen0(size);
        for (var i = 1; i < arrsize; i++) {
            arr[i] = gen(size);
        }
        return arr;
    });
}

// Helper, essentially: log2(size + 1)
function logsize(size) {
    return Math.max(Math.round(Math.log(size + 1) / Math.log(2), 0));
}

// basic types
const toSym = function (s) { return {sym: s} },
      fromSym = function (o) { return o.sym },
      firstChar = jsc.elements('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'.split('')).generator,
      restChar = jsc.elements('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_0123456789'.split('')).generator,
      symbol1 = jsc.bless({generator: generateNEArray1(firstChar, restChar)}).
          smap(jsc.utils.charArrayToString, jsc.utils.stringToCharArray).
          smap(toSym, fromSym),
      symbol = jsc.bless({
          generator: symbol1.generator,
          show: function (s) { return s.sym.toString() },
          shrink: symbol1.shrink
      })

const number = jsc.number,
      string = jsc.asciistring

// generate => size: nat -> lisp
const generateLisp = generator.recursive(
          generator.oneof([number.generator, string.generator, symbol.generator]),
          generator.array)

// show => lisp -> string
function showList(l) { return '(' + l.map(showLisp).join(' ') + ')' }
function showLisp(form) {
    switch (typeof form) {
    case 'number': return number.show(form)
    case 'string': return string.show(form)
    case 'object': return Array.isArray(form) ? showList(form) : symbol.show(form)
    default: throw new Error('unable to show lisp form: ', form)
    }
}

// shrink => lisp -> [lisp]
const shrinkLisp = shrink.bless(function (form) {
    switch (typeof form) {
    case 'number': return number.shrink(form)
    case 'string': return string.shrink(form)
    case 'object':
        return Array.isArray(form) ?
            shrink.array(shrinkLisp, form) :
            symbol.shrink(form)

    default: throw new Error('unable to shrink lisp form: ', form)
    }
})


module.exports = jsc.bless({
    generator: generateLisp,
    show: showLisp,
    shrink: shrinkLisp
})
