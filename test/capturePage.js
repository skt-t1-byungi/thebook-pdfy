const test = require('ava')
const os = require('os')
const path = require('path')
const fs = require('fs')
const capturePage = require('../lib/capturePage')

const TEMP_DEST = path.join(os.tmpdir(), '__tmp_captured_image.jpg')

test('capturePage', async t => {
    t.false(fs.existsSync(TEMP_DEST))
    await capturePage('/006962/ch01/01/', TEMP_DEST)
    t.true(fs.existsSync(TEMP_DEST))
    t.pass()
})

test.after.always(() => fs.unlinkSync(TEMP_DEST))
