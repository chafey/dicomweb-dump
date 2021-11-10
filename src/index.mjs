#!/usr/bin/env node

import processCommandLineArguments from './processCommandLineArguments.mjs'
import createOptionsFromArguments from './createOptionsFromArguments.mjs'
import engine from '../src/engine.mjs'

const main = async () => {

  const argv = processCommandLineArguments()

  const options = createOptionsFromArguments(argv)
  options.http2 = false // turn off http2 for now

  // replace console.log if we are in quiet mode
  if (argv.q) {
    console.log = () => { }
  }
  await engine.configure(options)

  const p = engine.dumpStudy(argv.s)

  setInterval(async () => {
    const stats = await engine.stats()
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(JSON.stringify(stats))
  }, 100)

  await engine.wait()
}

main().then(() => {
  console.log('')
  console.log('done')
  process.exit(0)
}).catch((err) => {
  console.log(err)
  process.exit(-1)
})