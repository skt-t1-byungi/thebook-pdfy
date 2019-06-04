#!/usr/bin/env node
const meow = require('meow')
const prompts = require('prompts')
const createLogger = require('./createLogger')
const { pdfy, pdfyAll } = require('.')

const cli = meow(`
Usage
    $ thebook-pdfy <?bookId|bookUrl>

Options
    --all, -a   Pdfy all the books.
    --dir, -d   Directory to save.
    --preview - p  Preview book with pdfy.
    --file-name -f
    --concurrency, -c
    --overwrite, -o

Examples
    $ thebook-pdfy
    $ thebook-pdfy 006982
    $ thebook-pdfy https://thebook.io/006982
    $ thebook-pdfy --all
`, {
    flags: {
        help: { alias: 'h' },
        version: { alias: 'v' },
        all: { type: 'boolean', alias: 'a' },
        dir: { type: 'string', alias: 'd', default: process.cwd() },
        fileName: { type: 'string', alias: 'f' },
        preview: { type: 'boolean', alias: 'p' },
        concurrency: { type: 'number', alias: 'c', default: 10 },
        overwrite: { type: 'boolean', alias: 'o' }
    }
})

const logger = createLogger()
const errorHandler = err => (console.log('\u001B[1K'), logger.fail(String(err)), process.exit(1))

if (cli.flags.all) {
    pdfyAll({ logger, ...cli.flags }).catch(errorHandler)
    return
}

if (cli.input.length > 0) {
    pdfyMultiple(cli.input, { logger, ...cli.flags }).catch(errorHandler)
    return
}

async function pdfyMultiple (bookIds, opts) {
    for (const bookId of new Set(bookIds)) await pdfy(bookId, opts)
}

(async () => {
    const isAll = await askOrExit({
        type: 'confirm',
        message: 'Do you want all pdfy?',
        initial: true
    })

    if (isAll) {
        const preview = await askOrExit({
            type: 'confirm',
            message: 'Do you include preview books?',
            initial: false
        })

        const dir = await askSaveDirOrExit()
        const overwrite = await askOverwriteOrExit()
        pdfyAll({ logger, dir, overwrite, preview }).catch(errorHandler)
        return
    }

    const bookIds = await askOrExit({
        type: 'list',
        message: 'Enter the id or url of the book to pdfy.'
    })
    const dir = await askSaveDirOrExit()
    const overwrite = await askOverwriteOrExit()

    pdfyMultiple(bookIds, { logger, dir, overwrite }).catch(errorHandler)
})()

function askOrExit (question) {
    return prompts({ name: 'value', ...question }, { onCancel: () => process.exit(0) }).then(r => r.value)
}

function askOverwriteOrExit () {
    return askOrExit({
        type: 'confirm',
        message: 'Do you want to overwrite when the file name is the same?',
        initial: false
    })
}

function askSaveDirOrExit () {
    return askOrExit({
        type: 'text',
        message: 'Enter the directory to save.',
        initial: process.cwd()
    })
}
