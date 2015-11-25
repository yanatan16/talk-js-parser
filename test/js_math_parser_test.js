const jsc = require('jsverify'),
      assert = require('chai').assert,
      jsMathParse = require('../lib/js_math_parser'),
      util = require('util'),
      esprima = require('esprima'),
      diff = require('deep-diff').diff

function assertSuccess(raw) {
    const p = jsMathParse(raw),
          exp = esprima.parse(raw)
    assert.ok(p.status, "Failed to parse: " + raw + " // " + util.inspect(p))
    assert.notOk(diff(p.value, exp), "Failed: \n\t"
                 + util.inspect(p.value, {depth: null}) + " \n\t!= "
                 + util.inspect(exp, {depth:null}) + " \n\tthus: ")
}

function assertFail(raw) {
    assert.notOk(jsonAstParse(raw).status, "Parsed bad js: " + raw)
}

describe('json parser', function () {
    describe('cases', function () {
        it('null parse succeeds', function () {
            assertSuccess('')
            assertSuccess(';')
            assertSuccess(';;;')
        })

        it('number literals', function () {
            assertSuccess('0;')
            assertSuccess('1.1;')
            assertSuccess('1.1e5;')
        })

        it('unary operators', function () {
            assertSuccess('-1;')
            assertSuccess('+55.5;')
        })

        it('operator without semicolon', function () {
            assertSuccess('+1')
        })

        it('binary operations', function () {
            assertSuccess('1 + 1;')
        })
    })
})
