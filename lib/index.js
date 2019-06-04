const getAllBookIds = require('./getAllBookIds')
const getBook = require('./getBook')
const path = require('path')
const fs = require('fs')
const pdfyBook = require('./pdfyBook')
const createLogger = require('./createLogger')
const unusedFilename = require('unused-filename')

exports.pdfyAll = async (opts = {}) => {
    opts = normalizeOpts(opts)
    const { logger, concurrency } = opts

    const bookIds = await logger.promise(getAllBookIds(), "Finding all book id's..")
    let cnt = 0
    for (const bookId of bookIds) {
        const book = await getBook(bookId)
        if (!book.isFull && opts.preview) continue

        logger.info(`Book title : ${book.title}`)
        if (!book.isFull) logger.warn('This book is a preview book (not all published).')

        let dest = path.join(opts.dir, book.title + '.pdf')
        if (fs.existsSync(dest) && !opts.overwrite) dest = await unusedFilename(dest)
        await pdfyBook(book, dest, { logger, concurrency })
        cnt++

        logger.info(`Complete pdfy - ${dest}`)
    }

    logger.succeed(`Complete all pdfy! (total: ${cnt})`)
}

exports.pdfy = async (bookId, opts = {}) => {
    if (!bookId) throw new TypeError('`bookId` is required.')
    if (typeof bookId !== 'string') throw new TypeError(`Expected "bookId" to be of type "string", but "${typeof bookId}".`)

    const matched = bookId.match(/\d{6}/)
    if (!matched) throw new TypeError('Invalid `bookId` option format.')
    bookId = matched[0]

    opts = normalizeOpts(opts)
    const { logger, concurrency } = opts

    const book = await logger.promise(getBook(bookId), 'Scanning book overview...')

    logger.info(`Book title : ${book.title}`)
    if (!book.isFull) logger.warn('This book is a preview book (not all published).')

    let dest = path.join(opts.dir, opts.fileName || (book.title + '.pdf'))
    if (fs.existsSync(dest) && !opts.overwrite) dest = await unusedFilename(dest)
    await pdfyBook(book, dest, { logger, concurrency })

    logger.succeed(`Complete pdfy - ${dest}`)
}

function normalizeOpts (opts) {
    if (opts.fileName && path.extname(opts.fileName) === '') opts.fileName += '.pdf'
    if (!opts.dir) opts.dir = process.cwd()
    if (!opts.logger) opts.logger = require('./nullLogger')
    if (!opts.logger.isLogger) opts.logger = createLogger(opts.logger)
    if (!opts.concurrency) opts.concurrency = 10
    if (!('overwrite' in opts)) opts.overwrite = true
    return opts
}
