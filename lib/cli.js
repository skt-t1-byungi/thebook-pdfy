const meow = require('meow')
const prompts = require('prompts')
const createLogger = require('./createLogger')
const modifyFilename = require('modify-filename')
const { pdfy, pdfyAll } = require('.')

const cli = meow(`
Usage
  $ thebook-pdfy <bookId|bookUrl>

Options
  --all, -a   get all books
  --output, -o   save directory
  --file-name -f   file name

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
        output: { type: 'string', alias: 'o', default: process.cwd() },
        fileName: { type: 'string', alias: 'f' },
        concurrency: { type: 'number', alias: 'c', default: 10 }
    }
})

const logger = createLogger()
const errorHandler = err => (console.log('\u001B[1K'), logger.fail(String(err)), process.exit(1))

if (cli.flags.all) {
    pdfyAll({ logger, output: cli.flags.output }).catch(errorHandler)
    return
}

if (cli.input.length > 0) {
    pdfyMultiple(cli.input, cli.flags).catch(errorHandler)
    return
}

async function pdfyMultiple (ids, { output, fileName }) {
    let i = 0
    for (const id of new Set(ids)) {
        await pdfy({
            id,
            output,
            logger,
            fileName: fileName && modifyFilename(fileName, (name, ext) => i++ > 0 ? `${name}${ext}` : `${name}-(${i})${ext}`)
        })
    }
}

(async () => {
    const isAll = await askOrExit({
        type: 'confirm',
        message: 'Do you want all pdfy?',
        initial: true
    })

    if (isAll) {
        const output = await askOutputOrExit()
        pdfyAll({ logger, output }).catch(errorHandler)
        return
    }

    const ids = await askOrExit({
        type: 'list',
        message: 'Enter the id or url of the book to pdfy.'
    })
    const output = await askOutputOrExit()
    pdfyMultiple(ids, { output }).catch(errorHandler)
})()

function askOrExit (question) {
    return prompts({ name: 'value', ...question }, { onCancel: () => process.exit(0) }).then(r => r.value)
}

function askOutputOrExit () {
    return askOrExit({
        type: 'text',
        message: 'Enter the directory to save.',
        initial: process.cwd()
    })
}
