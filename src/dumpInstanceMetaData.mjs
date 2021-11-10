import fs from 'fs'
import { promises as fsasync } from 'fs'
import dumpInstanceFrames from './dumpInstanceFrames.mjs'

const dumpInstanceMetaData = async (requestQueue, sopInstanceRootUrl, sopInstanceRootPath, options) => {
    const sopInstanceMetaDataUrl = sopInstanceRootUrl + '/metadata'
    const sopInstanceMetaDataPath = sopInstanceRootPath + '/metadata'
    const dump = await requestQueue.add({ sourceUri: sopInstanceMetaDataUrl, outFilePath: sopInstanceMetaDataPath, options })
    if (dump.response.statusCode === 200) {
        const body = fs.readFileSync(sopInstanceMetaDataPath)
        const sopInstanceMetaData = JSON.parse(body)
        await dumpInstanceFrames(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData[0], options)
    } else {
        fsasync.rm(sopInstanceRootPath, { recursive: true, force: true })
        requestQueue.failed++
        requestQueue.success--
    }
}

export default dumpInstanceMetaData