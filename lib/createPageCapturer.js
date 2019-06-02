const url = require('url')
const tempfile = require('tempfile')

/**
 * @param {import('puppeteer-core').Browser} browser
 */
module.exports = browser => async pageUrl => {
    pageUrl = String(new url.URL(pageUrl, 'https://thebook.io'))
    const page = await browser.newPage()
    try {
        await page.goto(pageUrl, { timeout: 0 })
        const imgPath = tempfile()
        const [, nextUrl] = await Promise.all([
            (async () => {
                const $sec = await page.$('#page_content > section')
                if (!$sec) throw new Error(`Parsing failed! - ${pageUrl}`)

                const { width, height } = await $sec.boundingBox()
                await page.setViewport({ width: ~~width + 500, height: ~~height + 500 })

                await $sec.screenshot({ path: imgPath, type: 'png', omitBackground: true })
            })(),
            page.$eval('#next-page', el => el && el.href).catch(() => null)
        ])

        return { imgPath, nextUrl }
    } finally {
        await page.close()
    }
}
