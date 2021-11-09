import RequestQueue from '../src/requestQueue.mjs'
import getAndWrite from '../src/getAndWrite2.mjs'
import dumpStudy2 from '../src/dumpStudy2.mjs'

const executor = (request) => {
    return getAndWrite(request.sourceUri, request.outFilePath, request.options)
}

let requestQueue = new RequestQueue(executor)
let options

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

export default {
    configure,
    dumpStudy,
    wait
}