const PDFDocument = require('pdfkit')
const fs = require('fs')
const { pipeline } = require('stream')

module.exports = (imgs, dest) => new Promise((resolve, reject) => {
    const doc = new PDFDocument({ autoFirstPage: false })

    pipeline(doc, fs.createWriteStream(dest), err => {
        if (err) reject(err)
        else resolve()
    })

    try {
        for (const img of imgs) {
            // Use the same PNG/JPEG decoder for dimensions and embedding.
            const image = doc.openImage(img)
            const { width, height } = image
            doc.addPage({ size: [width, height] }).image(image, 0, 0)
        }

        doc.end()
    } catch (err) {
        doc.destroy(err)
    }
})
