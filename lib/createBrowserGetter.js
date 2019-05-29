const puppeteer = require('puppeteer-core')
const findChrome = require('chrome-finder')

let pBrowser
let calls = 0

/**
 * @param {import('puppeteer-core').LaunchOptions} opts
 * @returns {()=>Promise<import('puppeteer-core').Browser>}
 */
module.exports = opts => () => {
    calls++
    if (!pBrowser) {
        pBrowser = puppeteer.launch({ ...opts, executablePath: findChrome() })
            .then(browser => {
                const close = browser.close.bind(browser)
                browser.close = () => {
                    if (--calls === 0) {
                        try {
                            return close()
                        } finally {
                            pBrowser = null
                        }
                    }
                }
                return browser
            })
    }
    return pBrowser
}
