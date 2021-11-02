import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const processCommandLineArguments = () => {
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
        .option('a', {
            alias: 'abort',
            description: 'abort processing on any errors (default is false/off)',
            type: 'boolean'
        })

        .demandOption(['w', 's', 'o'])
        .help()
        .alias('help', 'h')
        .argv

    return argv
}
export default processCommandLineArguments