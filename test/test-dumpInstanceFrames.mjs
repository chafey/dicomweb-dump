import dumpInstanceFrames from '../src/dumpInstanceFrames.mjs'
import assert from 'assert'
import fs from 'fs'
import RequestQueue from '../src/requestQueue.mjs'
import getAndWrite from '../src/getAndWrite.mjs'
import nock from 'nock'

describe('dumpInstanceFrames', async () => {

    it('exports', async () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(dumpInstanceFrames, undefined)
    })

    it('missing number of frames attribute succeeds', async () => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/frames/1')
            .reply(200, { message: 'test' })
            .persist()
        const sopInstanceRootUrl = 'https://sindresorhus.com'
        const sopInstanceRootPath = 'output'
        const options = { http2: false } // disable http2 since nock doesn't support it
        const executor = (request) => {
            return getAndWrite(request.sourceUri, request.outFilePath, request.options)
        }
        const requestQueue = new RequestQueue(executor)
        const sopInstanceMetaData =
        {
            '7FE00010': {
                "vr": "OB",
                "BulkDataURI": "http://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641/series/1.3.6.1.4.1.14519.5.2.1.7009.2403.338964154217479272713063899583/instances/1.3.6.1.4.1.14519.5.2.1.7009.2403.100877686310878799710044919259"
            }
        }
        // Act
        const promise = dumpInstanceFrames(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData, options)
        await requestQueue.empty()
        const dump = await promise
        //console.dir(dump)

        // Assert
        assert.ok(dump)
        assert.ok(fs.existsSync('output/frames/1'))
        scope.persist(false)
    })

    it('multiple frames succeeds', async () => {
        // Arrange
        const scope = nock('https://sindresorhus.com')
            .get('/frames/1')
            .reply(200, { message: 'test' })
            .persist()
        const scope2 = nock('https://sindresorhus.com')
            .get('/frames/2')
            .reply(200, { message: 'test' })
            .persist()
        const sopInstanceRootUrl = 'https://sindresorhus.com'
        const sopInstanceRootPath = 'output'
        const options = { http2: false } // disable http2 since nock doesn't support it
        const executor = (request) => {
            return getAndWrite(request.sourceUri, request.outFilePath, request.options)
        }
        const requestQueue = new RequestQueue(executor)
        const sopInstanceMetaData =
        {
            '00280008': {
                "vr": "IS",
                "Value": "2"
            },
            '7FE00010': {
                "vr": "OB",
                "BulkDataURI": "http://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641/series/1.3.6.1.4.1.14519.5.2.1.7009.2403.338964154217479272713063899583/instances/1.3.6.1.4.1.14519.5.2.1.7009.2403.100877686310878799710044919259"
            }
        }
        // Act
        const promise = dumpInstanceFrames(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData, options)
        await requestQueue.empty()
        const dump = await promise
        //console.dir(dump)

        // Assert
        assert.ok(dump)
        assert.ok(fs.existsSync('output/frames/1'))
        assert.ok(fs.existsSync('output/frames/2'))
        scope.persist(false)
    })
})
