const test = require('ava')
const fs = require('fs')
const capturePage = require('../lib/capturePage')

const imgs = []
const m = async pathUrl => {
    const imgPath = await capturePage(pathUrl)
    imgs.push(imgPath)
    return imgPath
}

const noop = () => {}
test.after.always(() => imgs.forEach(imgPath => fs.unlink(imgPath, noop)))

test('capturePage', async t => {
    const imgPath = await m('/006962/ch01/01/')
    // t.log(img)
    t.true(fs.existsSync(imgPath))
    fs.copyFileSync(imgPath, './examples/capturePage.jpg')
    t.pass()
})
