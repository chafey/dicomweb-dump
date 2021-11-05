import stream from 'stream'
import got from 'got'
import { promisify } from 'util'

const pipeline = promisify(stream.pipeline);

const createRequestOptions = (options) => {
    const requestOptions = {
        http2: options.http2 ?? true,
        headers: {}
    }

    if (options.authorization) {
        requestOptions.headers.Authorization = options.authorization
    }
    return requestOptions
}

// returns promise that resolves to dump object with info about the http request/response on success or rejects on error
const getUrlToStream = async (sourceUri, outStream, options) => {
    const dump = {
        url: sourceUri,
        request: {},
        response: {}
    }

    const requestOptions = createRequestOptions(options)
    const start = Date.now();
    const downloadStream = got.stream(sourceUri, requestOptions)

    dump.request.headers = downloadStream.options.headers
    dump.response.timeToHeaderInMS = Date.now() - start

    downloadStream.on('response', response => {
        dump.response.headers = JSON.parse(JSON.stringify(response.headers))
        dump.response.statusCode = response.statusCode
        dump.response.httpVersion = response.httpVersion
    })

    downloadStream.on('end', () => {
        dump.response.timeToLastByteInMS = Date.now() - start
    })

    await pipeline(downloadStream, outStream)

    //console.log('returning', dump)
    return dump
}

export default getUrlToStream