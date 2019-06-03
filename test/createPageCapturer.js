const test = require('ava')
const fs = require('fs')
const createBrowserGetter = require('get-puppeteer-browser')
const puppeteer = require('puppeteer-core')
const findChrome = require('chrome-finder')
const createPageCapturer = require('../lib/createPageCapturer')
const path = require('path')

const getBrowser = createBrowserGetter(puppeteer, { executablePath: findChrome(), headless: true, slowMo: 0 })

let browser
let capturePage

const imgs = []
const m = async pathUrl => {
    if (!capturePage) capturePage = createPageCapturer(browser = await getBrowser())
    const result = await capturePage(pathUrl)
    imgs.push(result.imgPath)
    return result
}

const noop = () => {}
test.after.always(() => {
    if (browser) browser.close()
    imgs.forEach(imgPath => fs.unlink(imgPath, noop))
})

test('capturePage', async t => {
    const res1 = await m('/006958/part01/ch02/01-02/')
    t.truthy(res1.nextUrl)
    t.true(fs.existsSync(res1.imgPath))
    fs.copyFileSync(res1.imgPath, path.join(__dirname, 'snapshot/capture1.png'))

    fs.copyFileSync((await m('/006884/ch01/03/03-01/')).imgPath, path.join(__dirname, 'snapshot/capture2.png'))
    fs.copyFileSync((await m('/006884/ch08/01/')).imgPath, path.join(__dirname, 'snapshot/capture3.png'))

    // end page
    const res4 = await m('006884/ch10/08/')
    t.falsy(res4.nextUrl)
})
