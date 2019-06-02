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
        fileName: { type: 'string', alias: 'f' }
    }
})

const logger = createLogger()

if (cli.flags.all) {
    pdfyAll({ logger, output: cli.flags.output })
    return
}

if (cli.input.length > 0) {
    pdfyMultiple(cli.input, cli.flags)
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
    const { isAll } = await prompts({
        type: 'confirm',
        name: 'isAll',
        message: 'Do you want all pdfy?',
        initial: true
    })

    if (isAll) {
        const { output } = await promptsOutput()
        pdfyAll({ logger, output })
        return
    }

    const { ids } = await prompts({
        type: 'list',
        name: 'ids',
        message: 'Enter the id or url of the book to pdfy.'
    })
    const { output } = await promptsOutput()
    pdfyMultiple(ids, { output })

    function promptsOutput () {
        return prompts({
            type: 'text',
            name: 'output',
            message: 'Enter the directory to save.',
            initial: process.cwd()
        })
    }
})()
