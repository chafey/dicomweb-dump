import concurrentGetAndWrite from '../src/concurrentGetAndWrite.mjs'
import assert from 'assert'
import fs from 'fs'
import RequestQueue from '../src/requestQueue.mjs'
import getAndWrite from '../src/getAndWrite.mjs'
import nock from 'nock'

const outFilePath = 'metadata.json'

describe('concurrentGetAndWrite', async () => {

    it('exports', async () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(concurrentGetAndWrite, undefined)
    })
    it('good url succeeds', async () => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/')
            .reply(200)
            .persist()
        const uri = 'https://sindresorhus.com'
        const outFilePath = 'metadata.json'
        const options = { http2: false } // disable http2 since nock doesn't support it
        const executor = (request) => {
            return getAndWrite(request.sourceUri, request.outFilePath, request.options)
        }
        const requestQueue = new RequestQueue(executor)

        // Act
        const promise = concurrentGetAndWrite(uri, outFilePath, requestQueue, options)
        await requestQueue.empty()
        const dump = await promise
        //console.dir(dump)

        // Assert
        assert.ok(dump)
        assert.ok(fs.existsSync(outFilePath))
        scope.persist(false)
    })

    it('bad url fails', async () => {
        // Arrange
        const uri = 'barf';
        const outFilePath = 'metadata.json'
        const options = { http2: false } // disable http2 since nock doesn't support it
        const executor = (request) => {
            return getAndWrite(request.sourceUri, request.outFilePath, request.options)
        }
        const requestQueue = new RequestQueue(executor)

        // Act
        const promise = concurrentGetAndWrite(uri, outFilePath, requestQueue, options)
        // Assert
        promise.then(() => {
            assert.fail('should not succeed')
        }).catch((err) => {
            //console.log('zzz', err)
            assert.strictEqual(err.code, 'ERR_INVALID_URL')
            assert.ok(!fs.existsSync(outFilePath))
        })
        await requestQueue.empty()

    })
})
