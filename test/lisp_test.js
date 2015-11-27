var assert = require('chai').assert,
    parse = require('../lib/lisp')

function assertSuccess(raw, exp) {
    const result = parse(raw)
    assert.ok(result.status, "Failed parse on: " + raw)
    assert.deepEqual(result.value, exp)
}

function assertFailure(raw) {
    assert.notOk(parse(raw).status, "Succeed a bad parse on: " + raw)
}

describe('lisp parser', function () {
    it('works', function () {
        assertSuccess('()', [])
    })

    it('parses literals', function () {
        assertSuccess('5', 5)
        assertSuccess('5.123', 5.123)
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
