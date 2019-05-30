const test = require('ava')
const path = require('path')
const bundle = require('../lib/bundle')
const tempfile = require('tempfile')
const fs = require('fs')

const COVER = path.join(__dirname, 'fixtures/cover.jpg')
const IMGS = [...Array(2).keys()].map(n => path.join(__dirname, `fixtures/${n}.jpg`))
const DEST = tempfile()

test.after.always(() => fs.unlink(DEST, () => {}))

test('bundle', async t => {
    t.false(fs.existsSync(DEST))
    await bundle({ pages: IMGS, cover: COVER }, DEST)
    t.true(fs.existsSync(DEST))
    fs.copyFileSync(DEST, './examples/bundle.pdf')
})
