exports.pdfy = (opts = {}) => {
    if (typeof opts === 'string') {
        opts = {
            id: opts,
            output: process.cwd(),
            ext: 'pdf'
        }
    }
    if (!opts.id) throw new TypeError('Book `id` is required.')
    if (typeof opts.id !== 'string') throw new TypeError(`Expected "id" to be of type "string", but "${typeof opts.id}".`)

    const matched = opts.id.match(/\d{6}/)
    if (!matched) throw new TypeError('Invalid id format.')
    opts.id = matched[0]
}
