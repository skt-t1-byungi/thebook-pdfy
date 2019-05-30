const PDFDocument = require('pdfkit')
const fs = require('fs')
const util = require('util')
const imgSize = util.promisify(require('image-size'))

module.exports = ({ pages, cover }, dest) => new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false })

    async function addImage (path) {
        const { width, height } = await imgSize(path)
        const padding = 50
        doc.addPage({ size: [width + padding, height + padding] }).image(path, padding / 2, padding / 2)
    }

    doc.pipe(fs.createWriteStream(dest))
        .on('finish', resolve)
        .on('error', reject)

    await addImage(cover)
    for (const page of pages) await addImage(page)

    doc.end()
})
