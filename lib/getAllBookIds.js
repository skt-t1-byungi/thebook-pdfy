const httpie = require('httpie')

module.exports = async () => {
    /** @type {{data:string}} */
    const { data } = await httpie.get('https://thebook.io/')
    return [...new Set(data.match(/(?<=https:\/\/thebook.io\/)(\d{6})/g))]
}
