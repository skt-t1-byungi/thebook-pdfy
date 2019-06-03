const test = require('ava')
const fs = require('fs')
const createBrowserGetter = require('get-puppeteer-browser')
const puppeteer = require('puppeteer-core')
const findChrome = require('chrome-finder')
const createPageCapturer = require('../lib/createPageCapturer')
const path = require('path')

const getBrowser = createBrowserGetter(puppeteer, { executablePath: findChrome() })

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
    const res1 = await m('/006993/part02/ch11/01-02/')
    t.truthy(res1.nextUrl)
    t.true(fs.existsSync(res1.imgPath))
    fs.copyFileSync(res1.imgPath, path.join(__dirname, 'snapshot/capturePage.png'))

    // end page
    const res2 = await m('006884/ch10/08/')
    t.falsy(res2.nextUrl)
})
