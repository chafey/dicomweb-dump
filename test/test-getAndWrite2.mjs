import getAndWrite from '../src/getAndWrite2.mjs'
import assert from 'assert'
import fs from 'fs'
import nock from 'nock'

const outFilePath = 'metadata'

describe('getAndWrite2', async () => {

    it('exports', async () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(getAndWrite, undefined)
    })

    it('basics', async () => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/')
            .reply(200)
            .persist()
        const uri = 'https://sindresorhus.com'
        const options = { http2: false } // disable http2 since nock doesn't support it

        // Act
        const dump = await getAndWrite(uri, outFilePath, options)
        //console.dir(dump)

        // Assert
        assert.ok(dump)
        assert.ok(fs.existsSync(outFilePath))
        scope.persist(false)
    })

    it('get failure unlinks outFile', (done) => {
        // Arrange
        const uri = 'barf'
        const options = { http2: false } // disable http2 since nock doesn't support it

        // Act
        const promise = getAndWrite(uri, outFilePath, options)

        // Assert
        promise.then(() => {
            assert.fail('was not supposed to succeed')
        }).catch((err) => {
            assert.ok(err)
            const exists = fs.existsSync(outFilePath)
            assert.strictEqual(exists, false)
        }).finally(() => {
            done()
        })
    })
})
