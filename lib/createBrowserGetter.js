const puppeteer = require('puppeteer-core')
const findChrome = require('chrome-finder')

/**
 * @param {import('puppeteer-core').LaunchOptions} opts
 * @returns {()=>Promise<import('puppeteer-core').Browser>}
 */
module.exports = function (opts) {
    let pBrowser
    let calls = 0
    return () => {
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
}
