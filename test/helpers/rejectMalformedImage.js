const assert = require('assert')
const fs = require('fs')
const imgs2pdf = require('../../lib/imgs2pdf')

const [inputType, dest] = process.argv.slice(2)
const inputPath = dest + '.jpg'
// CVE-2025-71330: a valid ICNS entry type with a zero entry length.
const malformed = Buffer.from('69636e73000000106973333200000000', 'hex')

async function run () {
    try {
        let input = malformed
        if (inputType === 'path') {
            fs.writeFileSync(inputPath, malformed)
            input = inputPath
        }

        let error
        try {
            await imgs2pdf([input], dest)
        } catch (err) {
            error = err
        }
        assert(error, 'Malformed input must reject conversion')
        assert.strictEqual(error.message, 'Unknown image format.')
        console.log('rejected')
    } finally {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
    }
}

run().catch(err => {
    console.error(err)
    process.exitCode = 1
})
