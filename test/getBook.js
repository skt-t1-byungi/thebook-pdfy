const test = require('ava')
const getBook = require('../lib/getBook')

test('getBook', async t => {
    const b1 = await getBook('006884')
    t.log(b1)
    t.is(b1.title, '게임 서버 프로그래밍 교과서')
    t.true(b1.isFull)

    const b2 = await getBook('006777')
    t.log(b2)
    t.is(b2.title, '소프트웨어 장인')
    t.false(b2.isFull)
    t.pass()
})
