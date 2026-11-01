const test = require('ava')
const path = require('path')
const imgs2pdf = require('../lib/imgs2pdf')
const tempfile = require('tempfile')
const fs = require('fs')
const { execFile } = require('child_process')
const { promisify } = require('util')

const IMGS = [...[...Array(3).keys()].map(n => buildPath(`fixtures/${n}.png`))]
const PNG_SIZES = [[646, 822], [646, 535], [646, 357]]
const execFileAsync = promisify(execFile)

test.beforeEach(t => {
    t.context.dest = tempfile('.pdf')
})

test.afterEach.always(async t => {
    for (const file of [t.context.dest, t.context.dest + '.jpg']) {
        try {
            await fs.promises.unlink(file)
        } catch (err) {
            if (err.code !== 'ENOENT') throw err
        }
    }
})

test('imgs2pdf', async t => {
    const { dest } = t.context
    t.false(fs.existsSync(dest))
    await imgs2pdf(IMGS, dest)
    assertPages(t, dest, PNG_SIZES)
    fs.copyFileSync(dest, buildPath('snapshot/bundle.pdf'))
})

test('JPEG cover buffer and PNG screenshot paths preserve page sizes and order', async t => {
    const cover = fs.readFileSync(buildPath('fixtures/cover.jpg'))
    await imgs2pdf([cover, ...IMGS], t.context.dest)
    assertPages(t, t.context.dest, [[815, 1000], ...PNG_SIZES])
})

test('PNG buffers and JPEG paths are supported', async t => {
    const png = fs.readFileSync(IMGS[0])
    await imgs2pdf([png, buildPath('fixtures/cover.jpg')], t.context.dest)
    assertPages(t, t.context.dest, [PNG_SIZES[0], [815, 1000]])
})

for (const inputType of ['buffer', 'path']) {
    test(`rejects a zero-length ICNS entry from a ${inputType} without hanging`, async t => {
        // A parent-process timeout also catches a synchronous parser loop.
        const { stdout } = await execFileAsync(process.execPath, [
            '--max-old-space-size=64',
            buildPath('helpers/rejectMalformedImage.js'),
            inputType,
            t.context.dest
        ], { timeout: 5000, killSignal: 'SIGKILL' })
        t.is(stdout.trim(), 'rejected')
    })
}

test('rejects a missing input file', async t => {
    const err = await t.throwsAsync(imgs2pdf([tempfile('.png')], t.context.dest))
    t.is(err.code, 'ENOENT')
})

test('rejects an output stream error', async t => {
    const dest = path.join(tempfile(), 'output.pdf')
    const err = await t.throwsAsync(imgs2pdf(IMGS, dest))
    t.is(err.code, 'ENOENT')
})

function assertPages (t, dest, sizes) {
    const pdf = fs.readFileSync(dest, 'latin1')
    t.true(pdf.startsWith('%PDF-'))
    t.true(pdf.trim().endsWith('%%EOF'))
    t.is((pdf.match(/\/Type \/Page\b/g) || []).length, sizes.length)
    const boxes = (pdf.match(/\/MediaBox \[[^\]]+\]/g) || [])
        .map(box => box.slice(box.indexOf('[') + 1, -1).trim().split(/\s+/).map(Number))
    t.deepEqual(boxes, sizes.map(([width, height]) => [0, 0, width, height]))
}

function buildPath (_path) {
    return path.join(__dirname, _path)
}
