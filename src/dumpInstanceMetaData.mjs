
const dumpInstanceMetaData = async (requestQueue, sopInstanceRootUrl, sopInstanceRootPath, options) => {
    const sopInstanceMetaDataUrl = sopInstanceRootUrl + '/metadata'
    const sopInstanceMetaDataPath = sopInstanceRootPath + '/metadata'
    const dump = await requestQueue.add({ sourceUri: sopInstanceMetaDataUrl, outFilePath: sopInstanceMetaDataPath, options })
    if (dump.response.statusCode === 200) {
        return dump
    } else {
        requestQueue.failed++
        requestQueue.success--
        throw new Error('HTTP Request Failed', { cause: dump.responseStatusCode })
    }
}

export default dumpInstanceMetaData