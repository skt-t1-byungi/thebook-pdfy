const ora = require('ora')

/**
 * @param {import('ora').Options & {disabled: boolean}} opts
 * @returns {import('ora').Ora}
 */
module.exports = (opts = {}) => new Proxy({ isLogger: true }, {
    get (target, prop) {
        if (hasOwn(target, prop)) return Reflect.get(target, prop)
        if (opts.disabled) return returnNullObj
        if (prop === 'promise') return (p, text) => ora.promise(p, { ...opts, text })
        const o = ora(opts)
        return o[prop].bind(o)
    }
})

function hasOwn (o, prop) {
    return Object.prototype.hasOwnProperty.call(o, prop)
}

function returnNullObj () { return {} }
