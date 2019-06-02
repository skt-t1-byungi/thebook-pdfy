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
module.exports = async (book, dest) => {
    const browser = await getBrowser()
    const capturePage = createPageCapturer(browser)
    const pageImgs = []
    try {
        let nextPageUrl = book.firstPageLink
        while (nextPageUrl) {
            const res = await capturePage(nextPageUrl)
            pageImgs.push(res.imgPath)
            nextPageUrl = res.nextUrl
        }
    } finally {
        browser.close()
    }

    try {
        const coverImg = (await phin(book.coverUrl)).body
        await imgs2pdf([coverImg, ...pageImgs], dest)
    } finally {
        pageImgs.map(img => fs.unlink(img, noop))
    }
}

function noop () {}
