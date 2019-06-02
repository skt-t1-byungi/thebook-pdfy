const ora = require('ora')

/**
 * @param {import('ora').Options & {disabled: boolean}} opts
 * @returns {import('ora').Ora}
 */
module.exports = opts => new Proxy({ isLogger: true }, {
    get (target, prop) {
        if (Reflect.has(target, prop)) return Reflect.get(target, prop)
        if (opts.disabled) return () => ({})
        const o = ora(opts)
        if (prop === 'promise') {
            return (p, txt) => {
                const r = o.start(txt)
                return p.then(
                    res => (r.succeed(txt + ', completed.'), res),
                    err => (r.fail(txt + ', fail!'), err)
                )
            }
        }
        return o[prop].bind(o)
    }
})
