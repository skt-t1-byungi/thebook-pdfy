const test = require('ava')
const getAllBookIds = require('../lib/getAllBookIds')

test('getAllBookIds', async t => {
    const ids = await getAllBookIds()
    t.log(ids)
    t.true(Array.isArray(ids))
    t.true(ids.length > 0)
})
