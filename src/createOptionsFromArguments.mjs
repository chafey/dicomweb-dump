const createOptionsFromArguments = (argv) => {
    return {
        stripMultiPartMimeWrapper: argv.m,
        quiet: argv.q,
        includeFullInstance: argv.i,
        concurrency: argv.c ?? 1,
        abort: argv.a ?? false,
    }
}

export default createOptionsFromArguments