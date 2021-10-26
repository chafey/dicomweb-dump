import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'


const main = async () => {
    if(process.argv.length < 4) {
        console.log('node src/index.js <URL to study on DICOMweb server> <output directory>')
        return
    }

    const studyRootUrl = process.argv[2]
    const outputPath = process.argv[3]

    // WADO-RS Study Metadata
    const studyMetaDataResponse = await fetch(studyRootUrl + '/metadata')
    const bodyText = await studyMetaDataResponse.text()
    const studyMetaData = JSON.parse(bodyText)
    const studyUid = studyMetaData[0]["0020000D"].Value[0]
    console.log(studyUid)

    const studyRootPath = path.join(outputPath, studyUid)
    fs.mkdirSync(studyRootPath, { recursive: true })
    fs.writeFileSync(path.join(studyRootPath, 'metadata'), bodyText)

    const sopInstanceSeriesUids = studyMetaData.map((value) => value["0020000E"].Value[0])
    const uniqueSeriesUids = [...new Set(sopInstanceSeriesUids)]
    //console.log(uniqueSeriesUids)
    for (const seriesUid of uniqueSeriesUids) {
      const seriesRootUrl = studyRootUrl + '/series/' + seriesUid
      const seriesMetaDataResponse = await fetch(seriesRootUrl + '/metadata')
      const bodyText = await seriesMetaDataResponse.text()
      console.log('  ' + seriesUid)

      const seriesRootPath = path.join(studyRootPath, 'series', seriesUid)
      fs.mkdirSync(seriesRootPath, { recursive: true })
      fs.writeFileSync(path.join(seriesRootPath, 'metadata'), bodyText)

      const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
      for (const sopInstanceUid of sopInstanceUids) {
        const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
        const instanceMetaDataResponse = await fetch(sopInstanceRootUrl + '/metadata')
        const bodyText = await instanceMetaDataResponse.text()
        console.log('    ' + sopInstanceUid)
  
        const instanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)
        fs.mkdirSync(instanceRootPath, { recursive: true })
        fs.writeFileSync(path.join(instanceRootPath, 'metadata'), bodyText)
        
        // Frames
        let frameIndex = 1
        const frameRootUrl = sopInstanceRootUrl + '/frames'
        const frameRootPath = path.join(instanceRootPath, 'frames')
        fs.mkdirSync(frameRootPath, { recursive: true })

        do {
          const frameResponse = await fetch(frameRootUrl + '/' + frameIndex)
          if(frameResponse.status !== 200) {
            break
          }
          console.log('      frame ' + frameIndex)
          const bodyBuffer = await frameResponse.buffer()
          fs.writeFileSync(path.join(frameRootPath, '' + frameIndex), bodyBuffer)
          frameIndex++
        } while(true)
        
        // TODO: BulkData

      }
    }
        // for each series
      // WADO-RS Series Metadata
      // for each sop instance
        // WADO-RS Instance Metadata
        // WADO-RS Image Frames
        // WADO-RS BulkData
        // WADO-RS Instance
}

main().then(() => {

})