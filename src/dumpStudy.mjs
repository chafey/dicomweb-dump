import getAndWrite from './getAndWrite.mjs'
import path from 'path'
import Queue from 'promise-queue'
import dumpInstance from './dumpInstance.mjs'

const handleError = (message, err, options) => {
    if (!options.quiet) {
        console.error('ERROR - ', message, err)
    }
    if (options.abort) {
        throw new Error(message + err.toString())
    }
}

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

        // Get Series Metadata (JSON)
        promises.push(queue.add(() => getAndWrite(seriesRootUrl, seriesRootPath, 'metadata', false, options))
            .catch((err) => {
                handleError('series metadata', err, options)
            }))

        // iterate over each instance in this series
        const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
        for (const sopInstanceUid of sopInstanceUids) {
            const instanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)

            if (options.includeFullInstance) {
                // Get SopInstance (DICOM P10 format - multi-part mime wrapped)
                promises.push(queue.add(() => getAndWrite(seriesRootUrl + '/instances/', path.join(instanceRootPath, '_'), sopInstanceUid, true, options))
                    .catch((err) => {
                        handleError('sop instance', err, options)
                    }))
            }
            // Get Sop Instance metadata (JSON)
            const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
            promises.push(queue.add(() => dumpInstance(sopInstanceRootUrl, instanceRootPath, queue, options)))
            console.log('dumpInstance pushed')
        } // look over sop instances
    } // for() over series

    // wait for all promises to resolve or one of them to reject
    console.log('promises2.length=', promises.length)
    await Promise.all(promises)
}

export default dumpStudy