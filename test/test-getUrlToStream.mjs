import getUrlToStream from '../src/getUrlToStream.mjs'
import assert from 'assert'
import streamBuffers from 'stream-buffers'
import nock from 'nock'
import { PassThrough } from 'stream'

describe('getUrlToStream', async () => {

    it('exports', () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(getUrlToStream, undefined)
    })

    it('basics', async () => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/')
            .reply(200)
            .persist()
        const uri = 'https://sindresorhus.com'
        const outStream = new streamBuffers.WritableStreamBuffer()
        const options = { http2: false } // disable http2 since nock doesn't support it

        // Act
        const dump = await getUrlToStream(uri, outStream, options)
        //console.dir(dump)

        // Assert
        assert.ok(dump)
        assert.ok(dump.url)
        assert.ok(dump.request)
        assert.ok(dump.request.headers)
        assert.ok(dump.response)
        assert.notEqual(dump.response.timeToFirstByteInMS, undefined)
        assert.ok(dump.response.headers)
        assert.ok(dump.response.statusCode)
        assert.ok(dump.response.httpVersion !== undefined)
        assert.notEqual(dump.response.timeToLastByteInMS, undefined)
        scope.persist(false)
    })

    it('authorization header', async () => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/')
            .reply(200)
            .persist()
        const uri = 'https://sindresorhus.com'
        const outStream = new streamBuffers.WritableStreamBuffer()
        const options = {
            authorization: 'BEARER: FOO',
            http2: false // disable http2 since nock doesn't support it
        }

        // Act
        const dump = await getUrlToStream(uri, outStream, options)

        // Assert
        assert.ok(dump.request.headers.authorization)
        scope.persist(false)
    })

    it('cannot connect to server fails', (done) => {
        // Arrange
        const uri = 'barf'
        const outStream = new streamBuffers.WritableStreamBuffer()
        const options = { http2: false } // disable http2 since nock doesn't support it

        // Act
        const promise = getUrlToStream(uri, outStream, options)

        // Assert
        promise.then(() => {
            assert.fail('was not supposed to succeed')
        }).catch((err) => {
            assert.ok(err)
        }).finally(() => {
            done()
        })
    })

    it('bad outStream fails', (done) => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/')
            .reply(200)
            .persist()
        const uri = 'https://sindresorhus.com'
        const outStream = new PassThrough();
        const options = { http2: false } // disable http2 since nock doesn't support it

        // Act
        const promise = getUrlToStream(uri, outStream, options)
        outStream.emit('error', 'out stream failed')
        outStream.emit('close')

        // Assert
        promise.then(() => {
            assert.fail('was not supposed to succeed')
        }).catch((err) => {
            assert.ok(err)
        }).finally(() => {
            scope.persist(false)
            done()
        })
    })
})
