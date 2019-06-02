const phin = require('phin')
const cheerio = require('cheerio')

module.exports = async id => {
    const { body } = await phin(`https://thebook.io/${id}/`)
    const $ = cheerio.load(String(body))
    const $pages = $('#toc li')
    return {
        coverUrl: `https://thebook.io/img/covers/cover_${id}.jpg`,
        title: $('.book-overview h2').text().trim(),
        firstPageLink: $pages.first().find('a').attr('href'),
        isFull: !$pages.is('.disabled')
    }
}
