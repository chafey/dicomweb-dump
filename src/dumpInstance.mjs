import getAndWrite from './getAndWrite.mjs'
import path from 'path'

const dumpFrames = async (sopInstanceRootUrl, instanceRootPath, sopInstanceMetaData, queue, options) => {
    console.log('dumpFrames')
    const promises = []
    const frameRootUrl = sopInstanceRootUrl + '/frames'
    const frameRootPath = path.join(instanceRootPath, 'frames')
    const frames = sopInstanceMetaData[0]['00280008'] ?? 1
    for (let frameIndex = 1; frameIndex <= frames; frameIndex++) {
        //console.log('getting frame', frameIndex)
        promises.push(queue.add(() =>
            getAndWrite(frameRootUrl, frameRootPath, '/' + frameIndex, true, options)
        )) // frame
        //console.log('after frame')
    } // for() over frames
    console.log('promises.length=', promises.length)
    await Promise.all(promises)
    console.log('all frames done')
}

const dumpInstance = async (sopInstanceRootUrl, instanceRootPath, queue, options) => {
    const sopInstanceMetaDataResult = await getAndWrite(sopInstanceRootUrl, instanceRootPath, 'metadata', false, options)
    const sopInstanceMetaData = JSON.parse(sopInstanceMetaDataResult.bodyAsBuffer)
    const hasPixelData = sopInstanceMetaData[0]['7FE00010']
    if (hasPixelData) {
        await dumpFrames(sopInstanceRootUrl, instanceRootPath, sopInstanceMetaData, queue, options)
    }
    console.log('dumpInstance done')
}

export default dumpInstance