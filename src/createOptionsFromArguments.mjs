const createOptionsFromArguments = (argv) => {
    return {
        wadoRsRootUrl: argv.w,
        outputFolder: argv.o,
        stripMultiPartMimeWrapper: argv.m,
        quiet: argv.q,
        includeFullInstance: argv.i,
        concurrency: argv.c ?? 1,
        abort: argv.a ?? false,
        retry: argv.r ?? 3,
        authorization: argv.z,
        http2: argv.h2,
    }
}

export default createOptionsFromArguments