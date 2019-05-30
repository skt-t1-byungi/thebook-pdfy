const PDFDocument = require('pdfkit')
const fs = require('fs')
const util = require('util')
const imgSize = util.promisify(require('image-size'))

module.exports = (imgs, dest) => new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false })

    doc.pipe(fs.createWriteStream(dest))
        .on('finish', resolve)
        .on('error', reject)

    for (const img of imgs) {
        const { width, height } = await imgSize(img)
        doc.addPage({ size: [width, height] }).image(img, 0, 0)
    }

    doc.end()
})
