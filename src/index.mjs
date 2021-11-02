#!/usr/bin/env node

import dumpStudy from './dumpStudy.mjs'
import processCommandLineArguments from './processCommandLineArguments.mjs'
import createOptionsFromArguments from './createOptionsFromArguments.mjs'

const main = async () => {

  const argv = processCommandLineArguments()

  const options = createOptionsFromArguments(argv)

  // replace console.log if we are in quiet mode
  if (argv.q) {
    console.log = () => { }
  }

  await dumpStudy(argv.w, argv.o, argv.s, options)
}

main().then(() => {
  console.log('')
  console.log('done')
  process.exit(0)
}).catch((err) => {
  console.log(err)
  process.exit(-1)
})