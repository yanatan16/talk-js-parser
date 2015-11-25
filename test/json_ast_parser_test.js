const jsc = require('jsverify'),
      assert = require('chai').assert,
      jsonAstParse = require('../lib/json_ast_parser'),
      util = require('util'),
      esprima = require('esprima'),
      diff = require('deep-diff').diff

function assertSuccess(value) {
    const raw = JSON.stringify(value),
          p = jsonAstParse(raw),
          exp = esprima.parse('(' + raw + ')').body[0]
    assert.ok(p.status, "Failed to parse: " + raw)
    assert.notOk(diff(p.value, exp), "Failed: \n\t"
                 + util.inspect(p.value, {depth: null}) + " \n\t!= "
                 + util.inspect(exp, {depth:null}) + " \n\tthus: "
                 + util.inspect(diff(p.value, exp)))
}

function assertFail(raw) {
    assert.notOk(jsonAstParse(raw).status, "Parsed bad json: " + raw)
}

describe('json parser', function () {
    describe('cases', function () {
        it('null parse fails', function () {
            assertFail('')
        })

        it('non-string literals', function () {
            assertSuccess(null)
            assertSuccess(true)
            assertSuccess(false)
            assertSuccess(55.123)
            assertSuccess(-10)
        })

        it('string literals', function () {
            assertSuccess("")
            assertSuccess("abc")
            assertSuccess(String.fromCharCode(0))
            assertSuccess("hi\nthere")
            assertSuccess('\"')
            assertSuccess('\\"')
            assertSuccess('\\nbc')
        })

        it('bad literals', function () {
            assertFail('nul')
            assertFail('"abc')
            assertFail('alse')
        })

        it('arrays', function () {
            assertSuccess([])
            assertSuccess([1,"two",null])
            assertSuccess([[1,2,3],[4,5,6],[7,8,9]])
        })

        it('bad arrays', function () {
            assertFail('[1,2')
            assertFail('[,2]')
            assertFail('[1,,2]')
        })

        it('objects', function () {
            assertSuccess({})
            assertSuccess({"abc": "def"})
            assertSuccess({"foo": {"bar": ["baz", {"binge": 123}]}})
        })

        it('bad objects', function () {
            assertFail('{')
            assertFail('{hello: "there"}')
            assertFail('{"i":"love" "testing": "it"}')
            assertFail('{"you":"love", "testing"}')
        })
    })

    describe('properties', function () {
        jsc.property('equivalent to JSON', 'json', function (obj) {
            try { assertSuccess(obj); return true }
            catch (e) { /* console.log(e); */ return false }
        })
    })
})
