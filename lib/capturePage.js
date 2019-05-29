const createBrowserGetter = require('./createBrowserGetter')
const getBrowser = createBrowserGetter({ defaultViewport: { width: 1000, height: 2000 } })
const url = require('url')

module.exports = async (pageUrl, dst) => {
    const browser = await getBrowser()
    const page = await browser.newPage()
    try {
        await page.goto(new url.URL(pageUrl, 'https://thebook.io'))
        const $cnt = await page.$('#page_content > section')
        await $cnt.screenshot({ path: dst, type: 'jpeg', quality: 100 })
    } finally {
        await page.close()
    }
}
