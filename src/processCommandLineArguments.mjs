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
        /*
        .option('m', {
            alias: 'stripMultiPartMimeWrapper',
            description: 'removes the multi part mime wrapper around image frames and instances and saves it as a separate file with .bin extension',
            type: 'boolean',
        })*/
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
        .option('r', {
            alias: 'retry',
            description: 'request failure retry count (default 3)',
            type: 'number'
        })
        .option('z', {
            alias: 'authorization',
            description: 'HTTP Authorization header value',
            type: 'string'
        })
        .option('h2', {
            alias: 'http2',
            description: 'Use HTTP2 (default is HTTP1)',
            type: 'boolean'
        })
        .demandOption(['w', 's', 'o'])
        .help()
        .alias('help', 'h')
        .argv

    return argv
}
export default processCommandLineArguments