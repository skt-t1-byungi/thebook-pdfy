const getAllBookIds = require('./getAllBookIds')
const getBook = require('./getBook')
const pLimit = require('p-limit')
const path = require('path')
const pdfyBook = require('./pdfyBook')
const createLogger = require('./createLogger')

exports.pdfyAll = async (_opts = {}) => {
    const { concurrency, ...opts } = { concurrency: 3, ...normalizeOpts(_opts) }

    const { logger } = opts
    const limit = pLimit(concurrency)

    let spin
    let completed = 0
    function spinUpdate () {
        if (!spin) spin = logger.start()
        spin.text = `pending: ${limit.activeCount}, completed : ${completed}`
    }

    const runner = id => limit(async () => {
        spinUpdate()
        const book = await getBook(id)
        if (!book.isFull) return
        await pdfyBook(book, buildDest(opts, book))
        completed++
        spinUpdate()
    })

    logger.info('Start all books pdfy.')
    await Promise.all((await getAllBookIds()).map(runner))
    if (spin) spin.succeed(`completed : ${completed}`)
    logger.success('Complete all pdfy!')
}

exports.pdfy = async (opts = {}) => {
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
    await pdfyBook(book, buildDest(opts, book), { logger, concurrency })
    logger.succeed('Complete pdfy!')
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
