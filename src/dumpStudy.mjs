import fs from 'fs'
import path from 'path'
import dumpInstanceMetaData from './dumpInstanceMetaData.mjs'
import dumpInstanceP10 from './dumpInstanceP10.mjs'
import { promises as fsasync } from 'fs'
import dumpInstanceFrames from './dumpInstanceFrames.mjs'

const dumpStudy = async (requestQueue, studyUid, options) => {
    //console.log(requestQueue, studyUid, options)
    const studyRootUrl = options.wadoRsRootUrl + '/' + studyUid
    const studyRootPath = path.join(options.outputFolder, studyUid)
    fs.mkdirSync(studyRootPath, { recursive: true })

    // Get study metadata
    const sourceUri = studyRootUrl + '/metadata'
    const outFilePath = studyRootPath + '/metadata'
    await requestQueue.add({ sourceUri, outFilePath, options })
    const body = fs.readFileSync(outFilePath)
    const studyMetaData = JSON.parse(body)
    //console.log(studyMetaData)
    const sopInstanceSeriesUids = studyMetaData.map((value) => value["0020000E"].Value[0])
    const uniqueSeriesUids = [...new Set(sopInstanceSeriesUids)]

    // iterate over each series in this study
    for (const seriesUid of uniqueSeriesUids) {
        //console.log(seriesUid)
        const seriesRootUrl = studyRootUrl + '/series/' + seriesUid
        const seriesRootPath = path.join(studyRootPath, 'series', seriesUid)
        fs.mkdirSync(seriesRootPath, { recursive: true })

        const seriesMetaDataUrl = seriesRootUrl + '/metadata'
        const seriesMetaDataPath = seriesRootPath + '/metadata'

        // Get series metadata
        requestQueue.add({ sourceUri: seriesMetaDataUrl, outFilePath: seriesMetaDataPath, options }).then(async () => {
            const body = fs.readFileSync(seriesMetaDataPath)
            const seriesMetaData = JSON.parse(body)
            //console.log(seriesMetaData)

            // iterate over each instance in this series
            const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
            for (const sopInstanceUid of sopInstanceUids) {
                const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
                const sopInstanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)
                await fsasync.mkdir(sopInstanceRootPath, { recursive: true })

                // dump dicom p10 instance

                // Get sop instance metadata
                dumpInstanceMetaData(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, options).then(async (dump) => {
                    const sopInstanceMetaDataPath = sopInstanceRootPath + '/metadata'
                    const body = fs.readFileSync(sopInstanceMetaDataPath)
                    const sopInstanceMetaData = JSON.parse(body)
                    await dumpInstanceP10(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceUid, options)
                    await dumpInstanceFrames(requestQueue, sopInstanceRootUrl, sopInstanceRootPath, sopInstanceMetaData[0], options)
                }).catch((err) => {
                    fsasync.rm(sopInstanceRootPath, { recursive: true, force: true })
                })
            }
        })
    }
}

export default dumpStudy