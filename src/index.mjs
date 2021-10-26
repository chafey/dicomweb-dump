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
    if(studyMetaDataResponse.status !== 200) {
      console.log("ERROR fetching study metadata")
      return
    }
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
      if(seriesMetaDataResponse.status !== 200) {
        console.log("ERROR fetching series metadata for ", seriesUid)
        return
      }
  
      const bodyText = await seriesMetaDataResponse.text()
      console.log('  ' + seriesUid)

      const seriesRootPath = path.join(studyRootPath, 'series', seriesUid)
      fs.mkdirSync(seriesRootPath, { recursive: true })
      fs.writeFileSync(path.join(seriesRootPath, 'metadata'), bodyText)

      const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
      for (const sopInstanceUid of sopInstanceUids) {
        console.log('    ' + sopInstanceUid)
        const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
        const instanceMetaDataResponse = await fetch(sopInstanceRootUrl + '/metadata')
        if(instanceMetaDataResponse.status !== 200) {
          console.log("ERROR fetching instance metadata")
          return
        }
  
        const bodyText = await instanceMetaDataResponse.text()
        console.log('      metadata')
  
        const instanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)
        fs.mkdirSync(instanceRootPath, { recursive: true })
        fs.writeFileSync(path.join(instanceRootPath, 'metadata'), bodyText)
        
        // Instance
        const instanceResponse = await fetch(sopInstanceRootUrl)
        if(instanceResponse.status !== 200) {
          console.log("ERROR fetching instance")
          return
        }
        const instanceBodyBuffer = await instanceResponse.buffer()
  
        console.log('      instance')
  
        fs.mkdirSync(instanceRootPath, { recursive: true })
        fs.writeFileSync(path.join(instanceRootPath, 'instance'), instanceBodyBuffer)

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
}

main().then(() => {

})