const createPageCapturer = require('./createPageCapturer')
const pLimit = require('p-limit')
const phin = require('phin')
const imgs2pdf = require('./imgs2pdf')
const fs = require('fs')
const createBrowserGetter = require('get-puppeteer-browser')
const puppeteer = require('puppeteer-core')
const findChrome = require('chrome-finder')

const getBrowser = createBrowserGetter(puppeteer, { executablePath: findChrome() })

/**
 * @template T extends () => Promise<any>
 * @typedef {T extends () => Promise<infer R> ? R : any} ReturnPromiseType
 * @param {ReturnPromiseType<import('./getBook')>} book
 * @param {string} dest
 */
module.exports = async (book, dest, { logger, concurrency } = {}) => {
    if (!logger) logger = require('./nullLogger')

    const limit = pLimit(concurrency)
    const browser = await getBrowser()
    const capturePage = createPageCapturer(browser)

    logger.info(`Start page capture.`)

    let cnt = 1
    const spin = logger.start('Capturing.. 1 page')
    const runner = async (link, _, links) => {
        let nextPageUrl = link
        const imgs = []
        while (nextPageUrl) {
            const res = await limit(() => capturePage(nextPageUrl))
            spin.text = `Capturing ${++cnt} page..`
            imgs.push(res.imgPath)
            if (links.includes(res.nextUrl)) break
            nextPageUrl = res.nextUrl
        }
        return imgs
    }

    const pageImgs = []
    try {
        pageImgs.push(...(await Promise.all(book.chapterLinks.map(runner))).flat())
        spin.succeed(`Complete page capture.`)
    } finally {
        browser.close()
    }

    try {
        logger.info(`Start pdf save.`)
        const coverImg = (await phin(book.coverUrl)).body
        await logger.promise(imgs2pdf([coverImg, ...pageImgs], dest), `saving to ${dest}`)
    } finally {
        pageImgs.map(img => fs.unlink(img, noop))
    }
}

function noop () {}
