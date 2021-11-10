#!/usr/bin/env node

import processCommandLineArguments from './processCommandLineArguments.mjs'
import createOptionsFromArguments from './createOptionsFromArguments.mjs'
import engine from '../src/engine.mjs'

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const dumpStats = async () => {
  const stats = await engine.stats()
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  const downloaded = formatBytes(stats.bytesDownloaded)
  process.stdout.write(JSON.stringify(stats) + ' Downloaded: ' + downloaded)
}

const main = async () => {

  const argv = processCommandLineArguments()

  const options = createOptionsFromArguments(argv)

  // replace console.log if we are in quiet mode
  if (argv.q) {
    console.log = () => { }
  }
  await engine.configure(options)

  const p = engine.dumpStudy(argv.s)

  setInterval(async () => {
    await dumpStats()
  }, 100)

  await engine.wait()
  await dumpStats()
}

main().then(() => {
  console.log('')
  console.log('done')
  process.exit(0)
}).catch((err) => {
  console.log(err)
  process.exit(-1)
})