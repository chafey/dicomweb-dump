import { promises as fsasync } from 'fs'
import path from 'path'

const dumpInstanceP10 = async (requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceUid, options) => {
    // Get SopInstance (DICOM P10 format - multi-part mime wrapped)
    if (options.includeFullInstance) {
        const sopInstanceInstanceRootPath = path.join(sopInstanceRootPath, '_')
        await fsasync.mkdir(sopInstanceInstanceRootPath, { recursive: true })
        const sopInstanceInstancePath = path.join(sopInstanceInstanceRootPath, sopInstanceUid)
        const dump = await requestQueue.add({ sourceUri: sopInstanceRootUrl, outFilePath: sopInstanceInstancePath, options })
        if (dump.response.statusCode !== 200) {
            //await fsasync.rm(sopInstanceInstanceRootPath, { recursive: true, force: true })
            requestQueue.failed++
            requestQueue.success--
            //throw new Error('HTTP Request Failed', { cause: dump.responseStatusCode })
        }
    }
}

export default dumpInstanceP10