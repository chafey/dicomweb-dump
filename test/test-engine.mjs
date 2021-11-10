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
        // TODO: Mock up all the requests with nock
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

        // Act
        const p = engine.dumpStudy(studyUid)
        await engine.wait()
        const studyResults = await p

        // Assert
        // TODO: assert more stuff here
    })
})
