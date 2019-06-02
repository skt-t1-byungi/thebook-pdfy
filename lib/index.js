const getAllBookIds = require('./getAllBookIds')
const getBook = require('./getBook')
const pLimit = require('p-limit')
const path = require('path')
const pdfyBook = require('./pdfyBook')

exports.pdfyAll = async (_opts = {}) => {
    const { concurrency, ...opts } = { concurrency: 3, ..._opts }
    const limit = pLimit(concurrency)
    const runner = id => limit(async () => {
        const book = await getBook(id)
        if (book.isFull) await pdfyBook(book, buildDest(opts, book))
    })
    await Promise.all((await getAllBookIds()).map(runner))
}

exports.pdfy = async (opts = {}) => {
    opts = normalizeOpts(opts)

    const book = await getBook(opts.id)
    if (!book.isFull) throw new TypeError(`Preview book("${book.title}") is not supported!`)

    await pdfyBook(book, buildDest(opts, book))
}

function normalizeOpts (opts) {
    if (typeof opts === 'string') opts = { id: opts, output: process.cwd() }

    if (!opts.id) throw new TypeError('`id` is required.')
    if (typeof opts.id !== 'string') throw new TypeError(`Expected "id" to be of type "string", but "${typeof opts.id}".`)

    const matched = opts.id.match(/\d{6}/)
    if (!matched) throw new TypeError('Invalid `id` format.')
    opts.id = matched[0]

    if (opts.fileName && path.extname(opts.fileName) === '') opts.fileName += '.pdf'

    return opts
}

function buildDest (opts, book) {
    return path.join(opts.output, opts.fileName || (book.title + '.pdf'))
}
