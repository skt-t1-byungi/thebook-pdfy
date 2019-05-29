const PDFDocument = require('pdfkit')
const fs = require('fs')

module.exports = class BookBundler {
    _imgs = []

    add (img) {
        this._imgs.push(img)
        return this
    }

    bundle (dest) {
        const doc = new PDFDocument()
        return new Promise((resolve, reject) => {
            doc.pipe(fs.createWriteStream(dest))
                .on('finish', resolve)
                .on('error', reject)

            this._imgs.forEach(({ width, height, path }) => {
                doc.addPage({ size: [width, height] }).image(path)
            })

            doc.end()
        })
    }
}
