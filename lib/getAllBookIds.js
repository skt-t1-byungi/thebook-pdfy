const phin = require('phin')

module.exports = async () => {
    const { body } = await phin('https://thebook.io/')
    return [...new Set(String(body).match(/(?<=https:\/\/thebook.io\/)(\d{6})/g))]
}
