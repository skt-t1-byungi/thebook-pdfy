const PDFDocument = require('pdfkit')
const fs = require('fs')
const imgSize = require('image-size')

module.exports = (imgs, dest) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false })

    doc.pipe(fs.createWriteStream(dest))
        .on('finish', resolve)
        .on('error', reject)

    for (const img of imgs) {
        const { width, height } = imgSize(img)
        doc.addPage({ size: [width, height] }).image(img, 0, 0)
    }

    doc.end()
})
