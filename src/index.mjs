#!/usr/bin/env node

import {getAndWrite} from './getAndWrite.mjs'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const main = async () => {

  // process command line arguments
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
    .option('q', {
      alias: 'quiet',
      description: 'suppresses status messages to stdout',
      type: 'boolean'
    })
    .option('i', {
      alias: 'include full instance',
      description: 'adds the full instance to the dump (DICOM P10 instance)',
      type: 'boolean'
    })
    .demandOption(['w', 's', 'o'])
    .help()
    .alias('help', 'h')
    .argv

    // extract command line arguments
    const studyUid = argv.s
    const studyRootUrl = argv.w + '/' + studyUid
    const outputFolder = argv.o + '/' + studyUid
    const studyRootPath = path.join(outputFolder, studyUid)
    const includeFullInstance = argv.i
    const options = {
      stripMultiPartMimeWrapper: argv.m
    }

    // replace console.log if we are in quiet mode
    if(argv.q) {
      console.log = () => {}
    }

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
      await getAndWrite(seriesRootUrl, seriesRootPath, 'metadata', false, options)
      console.log('  ' + seriesUid)

      // iterate over each instance in this series
      const sopInstanceUids = studyMetaData.map((value) => value["00080018"].Value[0])
      for (const sopInstanceUid of sopInstanceUids) {
        console.log('    ' + sopInstanceUid)

        // Get Sop Instance metadata (JSON)
        const instanceRootPath = path.join(seriesRootPath, 'instances', sopInstanceUid)
        const sopInstanceRootUrl = seriesRootUrl + '/instances/' + sopInstanceUid
        await getAndWrite(sopInstanceRootUrl, instanceRootPath, 'metadata', false, options)
        console.log('      metadata')
  
        if(includeFullInstance)
        {
          // Get SopInstance (DICOM P10 format - multi-part mime wrapped)
          await getAndWrite(seriesRootUrl + '/instances/', path.join(instanceRootPath, '_'), sopInstanceUid, true, options)
          console.log('      instance')
        }

        let frameIndex = 1
        const frameRootUrl = sopInstanceRootUrl + '/frames'
        const frameRootPath = path.join(instanceRootPath, 'frames')
        // TODO - calculate number of frames and loop over them instead of using error to terminate
        try {
          do {
            // Get SopInstance frames (raw frame - multi-part mime wrapped)
            await getAndWrite(frameRootUrl, frameRootPath, '/' + frameIndex, true, options)
            console.log('      frame ' + frameIndex)
            frameIndex++
          } while(true)
        } catch(ex) {
          // suppress any errors since they are probably for frames that don't exist
        }

        // TODO: BulkData
        
      }
    }
}

main().then(() => {
  console.log('done')
  return 0
}).catch((err) => {
  console.log('error')
  console.log(err)
  return -1
})