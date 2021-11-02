#!/usr/bin/env node

import { getAndWrite } from './getAndWrite.mjs'
import path from 'path'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import http from 'http'
import https from 'https'
import Queue from 'promise-queue'
//import dumpStudy from './dumpStudy.mjs'

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
    .option('c', {
      alias: 'concurrency',
      description: 'controls maximum concurrent request count (default is 1)',
      type: 'number'
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
  if (argv.q) {
    console.log = () => { }
  }

  // Setup http agent for maximum concurrency
  const maxConcurrency = argv.c ?? 1

  const agentOptions = {
    keepAlive: true,
    maxSockets: maxConcurrency
  }

  const httpAgent = new http.Agent(agentOptions);
  const httpsAgent = new https.Agent(agentOptions);
  global.httpAgent = httpsAgent

  // setup queue for controlling concurrency
  var maxConcurrent = maxConcurrency;
  var maxQueue = Infinity;
  var queue = new Queue(maxConcurrent, maxQueue);

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

      if (includeFullInstance) {
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

main().then(() => {
  console.log('')
  console.log('done')
  return 0
}).catch((err) => {
  console.log('error')
  console.log(err)
  return -1
})