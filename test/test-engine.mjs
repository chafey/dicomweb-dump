import engine from '../src/engine.mjs'
import assert from 'assert'
import nock from 'nock'

describe('engine', async () => {

    it('exports', async () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(engine, undefined)
        assert.notStrictEqual(engine.configure, undefined)
        assert.notStrictEqual(engine.dumpStudy, undefined)
        assert.notStrictEqual(engine.wait, undefined)
    })

    it('basics', async () => {
        // Arrange
        const options = {
            wadoRsRootUrl: 'https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies',
            outputFolder: 'output',
            stripMultiPartMimeWrapper: false,
            quiet: false,
            includeFullInstance: false,
            concurrency: 5,
            abort: false,
            retry: 3,
            authorization: undefined,

        }
        await engine.configure(options)
        const studyUid = '1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1' // CR
        //const studyUid = '1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641' // Large CT

        // Act
        const p = engine.dumpStudy(studyUid)
        await engine.wait()
        const studyResults = await p

        // Assert
    })

    /*
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
        await requestQueue.empty()

        // Assert
        assert.rejects(() => promise)
        assert.ok(!fs.existsSync(outFilePath))
    })
    */
})
