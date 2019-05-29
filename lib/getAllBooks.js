const httpie = require('httpie')
const cheerio = require('cheerio')

module.exports = async () => {
    const { data } = await httpie.get('https://thebook.io/')
    const $ = cheerio.load(data)
    return $('a.mdl-button[href^="https://thebook.io"]')
        .map((_, el) => ({
            url: (el = $(el)).attr('href'),
            no: el.attr('href').slice(-6),
            title: el.text().trim()
        }))
        .get()
}
