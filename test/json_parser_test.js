const jsc = require('jsverify'),
      assert = require('chai').assert,
      jsonparse = require('../lib/json_parser'),
      util = require('util')

function assertSuccess(value) {
    const raw = JSON.stringify(value),
          p = jsonparse(raw)
    assert.ok(p.status, "Failed to parse: " + raw)
    assert.deepEqual(p.value, value,
                     "Bad value match: " + util.inspect(p.value)
                     + "(" + JSON.stringify(p.value) + ")"
                     + " != " + util.inspect(value))
}

function assertFail(raw) {
    assert.notOk(jsonparse(raw).status, "Parsed bad json: " + raw)
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
