const createPageCapturer = require('./createPageCapturer')
const phin = require('phin')
const imgs2pdf = require('./imgs2pdf')
const fs = require('fs')
const createBrowserGetter = require('get-puppeteer-browser')
const puppeteer = require('puppeteer-core')
const findChrome = require('chrome-finder')

const getBrowser = createBrowserGetter(puppeteer, { executablePath: findChrome() })

/**
 * @param {ReturnType<import('./getBook')>} book
 * @param {string} dest
 */
module.exports = async (book, dest, { logger } = {}) => {
    if (!logger) logger = require('./nullLogger')

    const browser = await getBrowser()
    logger.info(`start page capture.`)

    const capturePage = createPageCapturer(browser)
    const pageImgs = []
    try {
        const r = logger.start()
        let i = 0
        let nextPageUrl = book.firstPageLink
        while (nextPageUrl) {
            r.text = `capturing ${++i} page...`
            const res = await capturePage(nextPageUrl)
            pageImgs.push(res.imgPath)
            nextPageUrl = res.nextUrl
        }
        r.succeed(`completed page capture.`)
    } finally {
        browser.close()
    }

    logger.info(`start pdf save.`)
    try {
        const coverImg = (await phin(book.coverUrl)).body
        await logger.promise(imgs2pdf([coverImg, ...pageImgs], dest), `saving to ${dest}`)
    } finally {
        pageImgs.map(img => fs.unlink(img, noop))
    }
}

function noop () {}
