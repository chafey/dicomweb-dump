
const concurrentGetAndWrite = (sourceUri, outFilePath, requestQueue, options) => {
    return requestQueue.add({ sourceUri, outFilePath, options })
}

export default concurrentGetAndWrite