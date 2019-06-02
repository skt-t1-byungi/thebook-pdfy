const getAllBookIds = require('./getAllBookIds')
const getBook = require('./getBook')
const pLimit = require('p-limit')
const path = require('path')
const pdfyBook = require('./pdfyBook')
const createLogger = require('./createLogger')

exports.pdfyAll = async (_opts = {}) => {
    const { concurrency, ...opts } = { concurrency: 3, ...normalizeOpts(_opts) }

    const limit = pLimit(concurrency)
    const runner = id => limit(async () => {
        const book = await getBook(id)
        if (book.isFull) await pdfyBook(book, buildDest(opts, book))
    })

    await Promise.all((await getAllBookIds()).map(runner))
}

exports.pdfy = async (opts = {}) => {
    if (typeof opts === 'string') opts = { id: opts }

    if (!opts.id) throw new TypeError('`id` is required.')
    if (typeof opts.id !== 'string') throw new TypeError(`Expected "id" to be of type "string", but "${typeof opts.id}".`)

    const matched = opts.id.match(/\d{6}/)
    if (!matched) throw new TypeError('Invalid `id` format.')
    opts.id = matched[0]

    opts = normalizeOpts(opts)

    const { logger } = opts
    logger.info('start scrap book information page.')
    const book = await logger.promise(getBook(opts.id), 'scrapping..')
    if (!book.isFull) throw new TypeError(`Preview book is not supported! (title:"${book.title}")`)

    await pdfyBook(book, buildDest(opts, book), { logger })
    logger.info('completed!')
}

function normalizeOpts (opts) {
    if (opts.fileName && path.extname(opts.fileName) === '') opts.fileName += '.pdf'
    if (!opts.output) opts.output = process.cwd()
    if (!opts.logger) opts.logger = require('./nullLogger')
    if (!opts.logger.isLogger) opts.logger = createLogger(opts.logger)
    return opts
}

function buildDest (opts, book) {
    return path.join(opts.output, opts.fileName || (book.title + '.pdf'))
}
