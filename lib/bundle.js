const PDFDocument = require('pdfkit')
const fs = require('fs')
const util = require('util')
const imgSize = util.promisify(require('image-size'))

module.exports = ({ pages, cover }, dest) => new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false })

    doc.pipe(fs.createWriteStream(dest))
        .on('finish', resolve)
        .on('error', reject)

    async function addImage (path) {
        const { width, height } = await imgSize(path)
        doc.addPage({ size: [width, height] }).image(path, 0, 0)
    }

    await addImage(cover)
    for (const page of pages) await addImage(page)

    doc.end()
})
