const getAllBookIds = require('./getAllBookIds')
const getBook = require('./getBook')
const path = require('path')
const pdfyBook = require('./pdfyBook')
const createLogger = require('./createLogger')

exports.pdfyAll = async (opts = {}) => {
    opts = normalizeOpts(opts)
    const { logger } = opts

    logger.info('Find all book ids.')
    const bookIds = logger.promise(getAllBookIds(), "finding all book id's..")
    for (const id of bookIds) await pdfy({ id, ...opts })

    logger.success(`Complete all pdfy - total:${bookIds.length}`)
}

const pdfy = exports.pdfy = async (opts = {}) => {
    if (typeof opts === 'string') opts = { id: opts }

    if (!opts.id) throw new TypeError('`id` option is required.')
    if (typeof opts.id !== 'string') throw new TypeError(`Expected "id" option to be of type "string", but "${typeof opts.id}".`)

    const matched = opts.id.match(/\d{6}/)
    if (!matched) throw new TypeError('Invalid `id` option format.')
    opts.id = matched[0]

    opts = normalizeOpts(opts)

    const { logger, concurrency } = opts
    logger.info('Scan book overview.')
    const book = await logger.promise(getBook(opts.id), 'scanning..')

    logger.info(`Book title : ${book.title}`)
    const dest = buildDest(opts, book)
    await pdfyBook(book, dest, { logger, concurrency })
    logger.info(`Complete pdfy - ${dest}`)
}

function normalizeOpts (opts) {
    if (opts.fileName && path.extname(opts.fileName) === '') opts.fileName += '.pdf'
    if (!opts.output) opts.output = process.cwd()
    if (!opts.logger) opts.logger = require('./nullLogger')
    if (!opts.logger.isLogger) opts.logger = createLogger(opts.logger)
    if (!opts.concurrency) opts.concurrency = 10
    return opts
}

function buildDest (opts, book) {
    return path.join(opts.output, opts.fileName || (book.title + '.pdf'))
}
