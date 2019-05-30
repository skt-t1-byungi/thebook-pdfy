const createBrowserGetter = require('./createBrowserGetter')
const url = require('url')
const tempfile = require('tempfile')

const getBrowser = createBrowserGetter()

module.exports = async pageUrl => {
    const browser = await getBrowser()
    const page = await browser.newPage()
    try {
        await page.goto(new url.URL(pageUrl, 'https://thebook.io'))
        const $sec = await page.$('#page_content > section')
        const path = tempfile()
        const { width, height } = await $sec.boundingBox()
        await page.setViewport({ width: width + 500, height: height + 500 })
        await $sec.screenshot({ path, type: 'jpeg', quality: 100 })
        return path
    } finally {
        page.close()
    }
}
