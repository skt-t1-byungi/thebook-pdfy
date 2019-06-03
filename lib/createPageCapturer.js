const url = require('url')
const tempfile = require('tempfile')
const normalizePathname = require('./normalizePathname')

/**
 * @param {import('puppeteer-core').Browser} browser
 */
module.exports = browser => async pageUrl => {
    pageUrl = String(new url.URL(pageUrl, 'https://thebook.io'))
    const page = await browser.newPage()
    await page.setViewport({ width: 0, height: 0, deviceScaleFactor: 1.5 })
    try {
        await page.goto(pageUrl, { timeout: 0 })
        const imgPath = tempfile()
        const [, nextUrl] = await Promise.all([
            (async () => {
                await page.$eval('header', el => el.remove())
                const $sec = await page.$('#page_content > section')
                if (!$sec) throw new Error(`Parsing failed! - ${pageUrl}`)
                await $sec.screenshot({ path: imgPath, type: 'png', omitBackground: true })
            })(),
            page.$eval('#next-page', el => el && el.href)
                .then(normalizePathname)
                .catch(() => null)
        ])

        return { imgPath, nextUrl }
    } finally {
        await page.close()
    }
}
