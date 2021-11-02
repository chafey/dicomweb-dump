const createOptionsFromArguments = (argv) => {
    return {
        stripMultiPartMimeWrapper: argv.m,
        quiet: argv.q,
        includeFullInstance: argv.i,
        concurrency: argv.c ?? 1,
        abort: argv.a ?? false,
        retry: argv.r ?? 3,
    }
}

export default createOptionsFromArguments