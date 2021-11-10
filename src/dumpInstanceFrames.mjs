import fs from 'fs'
import path from 'path'

const dumpInstanceFrames = (requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData, options) => {
    const hasPixelData = sopInstanceMetaData[0]['7FE00010']
    if (!hasPixelData) {
        return
    }
    const frameRootUrl = sopInstanceRootUrl + '/frames'
    const frameRootPath = path.join(sopInstanceRootPath, 'frames')
    fs.mkdirSync(frameRootPath, { recursive: true })
    const frames = sopInstanceMetaData[0]['00280008'] ?? 1
    for (let frameIndex = 1; frameIndex <= frames; frameIndex++) {
        const frameUrl = frameRootUrl + '/' + frameIndex
        const framePath = frameRootPath + '/' + frameIndex
        requestQueue.add({ sourceUri: frameUrl, outFilePath: framePath, options })
    }
}
export default dumpInstanceFrames