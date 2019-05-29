const test = require('ava')
const getAllBooks = require('../lib/getAllBooks')

test('getAllBooks', async t => {
    const books = await getAllBooks()
    t.log(books)
    t.true(Array.isArray(books))
    t.true(books.length > 0)
})
