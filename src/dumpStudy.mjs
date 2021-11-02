import { getAndWrite } from './getAndWrite.mjs'
import path from 'path'
import Queue from 'promise-queue'

const dumpStudy = async (wadoRsRootUrl, outputFolder, studyUid, options) => {
    const studyRootUrl = wadoRsRootUrl + '/' + studyUid
    const studyRootPath = path.join(outputFolder, studyUid)

    // setup queue for controlling concurrency
    var maxQueue = Infinity;
    var queue = new Queue(options.concurrency, maxQueue);

    const promises = []

    // Get Study Metadata (JSON)
    const response = await getAndWrite(studyRootUrl, studyRootPath, 'metadata', false, options)
    const studyMetaData = JSON.parse(response.bodyAsBuffer)
    const sopInstanceSeriesUids = studyMetaData.map((value) => value["0020000E"].Value[0])
    const uniqueSeriesUids = [...new Set(sopInstanceSeriesUids)]

    // iterate over each series in this study
    for (const seriesUid of uniqueSeriesUids) {
        const seriesRootUrl = studyRootUrl + '/series/' + seriesUid
        const seriesRootPath = path.join(studyRootPath, 'series', seriesUid)

        // Get Series Metadata
        promises.push(queue.add(() => { return getAndWrite(seriesRootUrl, seriesRootPath, 'metadata', false, options) })
            .catch(() => {
                //supress
            }))

        // iterate over each instance in this series
        const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
        for (const sopInstanceUid of sopInstanceUids) {
            //console.log(studyUid + "/" + seriesUid + "/" + sopInstanceUid)

            const instanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)

            if (options.includeFullInstance) {
                // Get SopInstance (DICOM P10 format - multi-part mime wrapped)
                promises.push(queue.add(() => {
                    return getAndWrite(seriesRootUrl + '/instances/', path.join(instanceRootPath, '_'), sopInstanceUid, true, options)
                        .catch(() => {
                            //console.log('error...')
                        })
                }))
            }
            // Get Sop Instance metadata (JSON)
            const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
            promises.push(queue.add(async () => {
                await getAndWrite(sopInstanceRootUrl, instanceRootPath, 'metadata', false, options).then((res) => {
                    const sopInstanceMetaData = JSON.parse(res.bodyAsBuffer)
                    const hasPixelData = sopInstanceMetaData[0]['7FE00010']
                    if (hasPixelData) {
                        const frameRootUrl = sopInstanceRootUrl + '/frames'
                        const frameRootPath = path.join(instanceRootPath, 'frames')
                        const frames = sopInstanceMetaData[0]['00280008'] ?? 1
                        for (let frameIndex = 1; frameIndex <= frames; frameIndex++) {
                            promises.push(queue.add(() => { return getAndWrite(frameRootUrl, frameRootPath, '/' + frameIndex, true, options).catch(() => { }) }))
                        }
                    }
                    // TODO: BulkData
                }).catch((err) => {
                    console.log('error...')
                })
            }))
        }
    }
    await Promise.all(promises)
}

export default dumpStudy