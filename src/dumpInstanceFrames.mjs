import fs from 'fs'
import path from 'path'

const getFrames = (sopInstanceMetaData) => {
    const numberOfFrames = sopInstanceMetaData['00280008']
    if (!numberOfFrames) {
        return 1
    }
    return parseInt(numberOfFrames.Value)
}

/**
 * Dumps all image frames for a given instance.  
 * 
 * @param requestQueue 
 * @param sopInstanceRootUrl 
 * @param sopInstanceRootPath 
 * @param sopInstanceMetaData 
 * @param options 
 * @returns Promise that resolves to an array of promise results for each frame request
 */
const dumpInstanceFrames = async (requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData, options) => {
    const hasPixelData = sopInstanceMetaData['7FE00010']
    if (!hasPixelData) {
        return
    }
    const frameRootUrl = sopInstanceRootUrl + '/frames'
    const frameRootPath = path.join(sopInstanceRootPath, 'frames')
    fs.mkdirSync(frameRootPath, { recursive: true })
    const frames = getFrames(sopInstanceMetaData)
    const promises = []
    for (let frameIndex = 1; frameIndex <= frames; frameIndex++) {
        const frameUrl = frameRootUrl + '/' + frameIndex
        const framePath = frameRootPath + '/' + frameIndex
        await requestQueue.add({ sourceUri: frameUrl, outFilePath: framePath, options })
    }
    return Promise.allSettled(promises)
}
export default dumpInstanceFrames