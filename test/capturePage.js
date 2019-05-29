const test = require('ava')
const fs = require('fs')
const capturePage = require('../lib/capturePage')

const imgs = []
const m = async pathUrl => {
    const img = await capturePage(pathUrl)
    imgs.push(img)
    return img
}

const noop = () => {}
test.after.always(() => imgs.forEach(img => fs.unlink(img.path, noop)))

test('capturePage', async t => {
    const img = await m('/006962/ch01/01/')
    // t.log(img)
    t.true(fs.existsSync(img.path))
    // fs.copyFileSync(img.path, './test.jpg')
    t.pass()
})
