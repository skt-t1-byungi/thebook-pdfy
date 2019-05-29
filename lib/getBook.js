const httpie = require('httpie')
const cheerio = require('cheerio')

module.exports = async id => {
    const { data } = await httpie.get(`https://thebook.io/${id}/`)
    const $ = cheerio.load(data)
    const cover = `https://thebook.io/img/covers/cover_${id}.jpg`
    const title = $('.book-overview h2').text().trim()
    const pages = $('#toc li')
        .map((no, el) => ({
            no,
            title: (el = $(el)).text().trim(),
            link: el.find('a').attr('href') || null,
            disabled: el.is('.disabled')
        }))
        .get()
    return { cover, title, pages, isFull: !pages.find(p => p.disabled) }
}
