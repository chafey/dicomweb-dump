import RequestQueue from '../src/requestQueue.mjs'
import getAndWrite from '../src/getAndWrite2.mjs'
import dumpStudy2 from './dumpStudy.mjs'

let options
let requestQueue

const executor = async (request) => {
    let retryCount = 0
    do {
        try {
            return await getAndWrite(request.sourceUri, request.outFilePath, request.options)
        } catch (err) {
            // retry specific errors that are transient
            if (err.code === 'ENOTFOUND' && retryCount++ < options.retry) {
                requestQueue.retries++
            } else {
                throw err
            }
        }
    } while (true)
}

requestQueue = new RequestQueue(executor)

const configure = async (opts) => {
    await requestQueue.empty()
    options = opts
    requestQueue = new RequestQueue(executor, options.concurrency)
}

// returns a promise that resolves once the study has been dumped.  The resolved object includes information about the dump 
const dumpStudy = async (studyUid) => {
    await dumpStudy2(requestQueue, studyUid, options)
}

const wait = async () => {
    await requestQueue.empty()
}

const stats = async () => {
    return requestQueue.stats()
}

export default {
    configure,
    dumpStudy,
    wait,
    stats
}