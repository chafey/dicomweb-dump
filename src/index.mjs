#!/usr/bin/env node

import {getAndWrite} from './getAndWrite.mjs'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const main = async () => {

  const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .option('w', {
      alias: 'wadoRsRootUrl',
      description: 'WADO-RS Root Url',
      type: 'string',
    })
    .option('s', {
      alias: 'studyUid',
      description: 'The Study Instance UID to dump',
      type: 'string',
    })
    .option('o', {
      alias: 'outputFolder',
      description: 'path',
      type: 'string',
    })
    .option('m', {
      alias: 'stripMultiPartMimeWrapper',
      description: 'removes the multi part mime wrapper around image frames and instances',
      type: 'boolean',
    })
    .demandOption(['w', 's', 'o'])
    .help()
    .alias('help', 'h')
    .argv

    //console.log(argv)

    const studyUid = argv.s
    const studyRootUrl = argv.w + '/' + studyUid
    const outputFolder = argv.o + '/' + studyUid
    const studyRootPath = path.join(outputFolder, studyUid)
    const options = {
      stripMultiPartMimeWrapper: argv.m
    }

    // WADO-RS Study Metadata
    const response = await getAndWrite(studyRootUrl, studyRootPath, 'metadata', false, options)
    const studyMetaData = JSON.parse(response.bodyAsBuffer)
    const sopInstanceSeriesUids = studyMetaData.map((value) => value["0020000E"].Value[0])
    const uniqueSeriesUids = [...new Set(sopInstanceSeriesUids)]
    //console.log(uniqueSeriesUids)

    // Process each series
    for (const seriesUid of uniqueSeriesUids) {
      const seriesRootUrl = studyRootUrl + '/series/' + seriesUid
      const seriesRootPath = path.join(studyRootPath, 'series', seriesUid)
      await getAndWrite(seriesRootUrl, seriesRootPath, 'metadata', false, options)
      console.log('  ' + seriesUid)

      const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
      for (const sopInstanceUid of sopInstanceUids) {
        console.log('    ' + sopInstanceUid)

        // instance metadata
        const instanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)
        const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
        await getAndWrite(sopInstanceRootUrl, instanceRootPath, 'metadata', false, options)
        console.log('      metadata')
  
        // instance
        await getAndWrite(seriesRootUrl + '/instances/', path.join(instanceRootPath, '_'), sopInstanceUid, true, options)

        // instance frames
        let frameIndex = 1
        const frameRootUrl = sopInstanceRootUrl + '/frames'
        const frameRootPath = path.join(instanceRootPath, 'frames')

        // TODO - calculate number of frames and loop over them instead of using error to terminate
        try {
          do {
            await getAndWrite(frameRootUrl, frameRootPath, '/' + frameIndex, true, options)
            console.log('      frame ' + frameIndex)
            frameIndex++
          } while(true)
        } catch(ex) {
          // suppress
        }

        // TODO: BulkData
        
      }
    }
}

main().then(() => {
  console.log('done')
}).catch((err) => {
  console.log('error')
  console.log(err)
})