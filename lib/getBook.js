const phin = require('phin')
const cheerio = require('cheerio')
const normalizePathname = require('./normalizePathname')

module.exports = async id => {
    const { body } = await phin(`https://thebook.io/${id}/`)
    const $ = cheerio.load(String(body))
    const $pages = $('#toc li')
    return {
        coverUrl: `https://thebook.io/img/covers/cover_${id}.jpg`,
        title: $('.book-overview h2').text().trim(),
        isFull: !$pages.is('.disabled'),
        chapterLinks: $pages
            .find('a')
            .map((_, el) => $(el).attr('href'))
            .get()
            .filter(href => href.startsWith('https://thebook.io/') || href.startsWith('/'))
            .map(normalizePathname)
    }
}
