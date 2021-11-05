import getUrlToStream from '../src/getUrlToStream.mjs'
import assert from 'assert'
import streamBuffers from 'stream-buffers'

describe('getUrlToStream', async () => {

    it('exports', async () => {
        // Arrange

        // Act

        // Assert
        assert.notStrictEqual(getUrlToStream, undefined)
    })

    it('basics', async () => {
        // Arrange
        const uri = 'https:/server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1/series/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.2/instances/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.3/metadata';
        const outStream = new streamBuffers.WritableStreamBuffer()

        // Act
        const dump = await getUrlToStream(uri, outStream, {})
        //console.dir(dump)

        // Assert
        assert.ok(dump)
    })

    it('dump', async () => {
        // Arrange
        const uri = 'https:/server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1/series/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.2/instances/1.3.6.1.4.1.25403.345050719074.3824.20170126085406.3/metadata';
        const outStream = new streamBuffers.WritableStreamBuffer()

        // Act
        const dump = await getUrlToStream(uri, outStream, {})
        //console.log(dump)

        // Assert
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
        const outStream = new streamBuffers.WritableStreamBuffer()

        // Act
        const promise = getUrlToStream(uri, outStream, {})

        // Assert
        promise
            .then(() => { assert.fail('was not supposed to succeed') })
            .catch(() => { })
    })

})
