/*import concurrentGetAndWrite from '../src/concurrentGetAndWrite.mjs'
import assert from 'assert'
import fs from 'fs'

const outFilePath = 'metadata.json'

describe('concurrentGetAndWrite', async () => {

    beforeEach(function () {
        if (fs.existsSync(outFilePath)) {
            fs.unlinkSync(outFilePath)
        }
    });

    afterEach(function () {
        if (fs.existsSync(outFilePath)) {
            fs.unlinkSync(outFilePath)
        }
    });


    it('exports', async () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(concurrentGetAndWrite, undefined)
    })

    it('basics', async () => {
        // Arrange
        const uri = 'https:/server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1/series/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.2/instances/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.3/metadata';
        const outFilePath = 'metadata.json'

        // Act
        const dump = await concurrentGetAndWrite(uri, outFilePath, {})
        //console.dir(dump)

        // Assert
        assert.ok(dump)
        assert.ok(fs.existsSync(outFilePath))
    })

    it('dump', async () => {
        // Arrange
        const uri = 'https:/server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1/series/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.2/instances/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.3/metadata';
        const outFilePath = 'metadata.json'

        // Act
        const dump = await concurrentGetAndWrite(uri, outFilePath, {})
        //console.log(dump)

        // Assert
        assert.ok(fs.existsSync(outFilePath))
        assert.ok(dump.url)
        assert.ok(dump.request)
        assert.ok(dump.request.headers)
        assert.ok(dump.response)
        assert.notEqual(dump.response.timeToHeaderInMS, undefined)
        assert.ok(dump.response.headers)
        assert.ok(dump.response.statusCode)
        assert.ok(dump.response.httpVersion)
        assert.notEqual(dump.response.timeToLastByteInMS, undefined)
    })

    it('bad url fails', async () => {
        // Arrange
        const uri = 'https:/server.dcmjssdfsdfds.org/'
        const outFilePath = 'metadata.json'

        // Act
        const promise = concurrentGetAndWrite(uri, outFilePath, {})

        // Assert
        promise
            .then(() => { assert.fail('was not supposed to succeed') })
            .catch(() => { })
    })
})
*/