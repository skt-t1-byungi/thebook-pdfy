const url = require('url')

module.exports = _path => {
    let { pathname } = new url.URL(_path, 'https://thebook.io')
    return (pathname[pathname.length - 1] === '/') ? pathname.slice(0, -1) : pathname
}
