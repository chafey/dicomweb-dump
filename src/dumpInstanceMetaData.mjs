import fs from 'fs'
import { promises as fsasync } from 'fs'
import dumpInstanceFrames from './dumpInstanceFrames.mjs'

const dumpInstanceMetaData = (requestQueue, sopInstanceRootUrl, sopInstanceRootPath, options) => {
    const sopInstanceMetaDataUrl = sopInstanceRootUrl + '/metadata'
    const sopInstanceMetaDataPath = sopInstanceRootPath + '/metadata'
    requestQueue.add({ sourceUri: sopInstanceMetaDataUrl, outFilePath: sopInstanceMetaDataPath, options }).then((dump) => {
        if (dump.response.statusCode === 200) {
            const body = fs.readFileSync(sopInstanceMetaDataPath)
            const sopInstanceMetaData = JSON.parse(body)
            dumpInstanceFrames(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData[0], options)
        } else {
            fsasync.rm(sopInstanceRootPath, { recursive: true, force: true })
            requestQueue.failed++
            requestQueue.success--
        }
    }).catch((err) => {
        console.log('yyy', err)
    })
}

export default dumpInstanceMetaData