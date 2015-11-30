var assert = require('chai').assert,
    jsc = require('jsverify'),
    parse = require('../lib/lisp'),
    genLisp = require('./lisp_gen')

function assertSuccess(raw, exp) {
    const result = parse(raw)
    assert.ok(result.status, "Failed parse on: " + raw)
    assert.deepEqual(result.value, exp)
}

function assertFailure(raw) {
    assert.notOk(parse(raw).status, "Succeed a bad parse on: " + raw)
}

describe('lisp parser', function () {
    describe('cases', function () {
        it('works', function () {
            assertSuccess('', undefined)
            assertSuccess('()', [])
        })

        it('parses literals', function () {
            assertSuccess('5', 5)
            assertSuccess('5.123', 5.123)
            assertSuccess('-1', -1)
            assertSuccess('5e-200', 5e-200)
            assertSuccess('"abc"', 'abc')
            assertSuccess('foo', {sym:'foo'})
        })

        it('parses s-expression', function () {
            assertSuccess('(foo 5 "bar")', [{sym:'foo'}, 5, "bar"])
            assertSuccess('((((foo))))', [[[[{sym:'foo'}]]]])
        })

        it('fails for bad forms', function () {
            assertFailure('(abd')
            assertFailure('[foo bar]')
        })

        it('ignores breaklines comments', function () {
            assertSuccess('(foo ; i called foo\n bar)',
                          [{sym:'foo'},{sym:'bar'}])
        })
    })

    describe('properties', function () {
        jsc.property('all lisp', genLisp, function (lisp) {
            // console.log('all lisp', JSON.stringify(lisp), genLisp.show(lisp))
            try { assertSuccess(genLisp.show(lisp), lisp);
                  return true }
            catch (e) {
                return false
            }
        })
    })
})
