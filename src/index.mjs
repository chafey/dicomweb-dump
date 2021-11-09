#!/usr/bin/env node

import dumpStudy from './dumpStudy2.mjs'
import processCommandLineArguments from './processCommandLineArguments.mjs'
import createOptionsFromArguments from './createOptionsFromArguments.mjs'
import engine from '../src/engine.mjs'

const main = async () => {

  const argv = processCommandLineArguments()

  const options = createOptionsFromArguments(argv)

  // replace console.log if we are in quiet mode
  if (argv.q) {
    console.log = () => { }
  }
  options.http2 = false // turn off http2 for now
  await engine.configure(options)
  //const studyUid = '1.3.6.1.4.1.25403.345050719074.3824.20170126085406.1' // CR
  //const studyUid = '1.3.6.1.4.1.14519.5.2.1.7009.2403.129940714907926843330943219641' // Large CT
  const studyUid = argv.s // Large CT

  // Act
  try {
    const p = engine.dumpStudy(studyUid)

    setInterval(async () => {
      const stats = await engine.stats()
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(JSON.stringify(stats))
    }, 100)

    await engine.wait()
  } catch (err) {
    console.log('ERR', err)
  }
}

main().then(() => {
  console.log('')
  console.log('done')
  process.exit(0)
}).catch((err) => {
  console.log(err)
  process.exit(-1)
})