import got from 'got'
import { pipeline } from 'stream/promises'

const createRequestOptions = (options) => {
    // enable HTTP2 by default
    const requestOptions = {
        http2: options.http2 ?? true,
        headers: {}
    }

    // add in authorization header
    if (options.authorization) {
        requestOptions.headers.Authorization = options.authorization
    }

    return requestOptions
}

// returns promise that resolves to dump object with info about the http request/response on success or rejects on error
const getUrlToStream = async (sourceUri, outStream, options) => {
    // initialize the dump structure to keep track of request details
    const dump = {
        url: sourceUri,
        request: {},
        response: {}
    }

    // get the url using the request option
    let downloadStream
    downloadStream = got.stream(sourceUri, createRequestOptions(options))

    // Save the request headers
    dump.request.headers = downloadStream.options.headers

    // save the response details
    downloadStream.on('response', response => {
        dump.response.headers = JSON.parse(JSON.stringify(response.headers))
        dump.response.statusCode = response.statusCode
        dump.response.httpVersion = response.httpVersion
    })

    // pipe data from the download stream to the output stream
    await pipeline(downloadStream, outStream)

    // Save timing metrics
    dump.response.timeWaitingInMS = downloadStream.timings.phases.wait
    dump.response.timeToFirstByteInMS = downloadStream.timings.phases.firstByte
    dump.response.timeToLastByteInMS = downloadStream.timings.phases.total

    //console.log('returning', dump)
    return dump
}

export default getUrlToStream