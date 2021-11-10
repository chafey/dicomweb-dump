const dumpInstanceP10 = () => {
    // Get SopInstance (DICOM P10 format - multi-part mime wrapped)
    /*if (options.includeFullInstance) {
        const sopInstanceInstanceRootPath = path.join(sopInstanceRootPath, '_')
        fs.mkdirSync(sopInstanceInstanceRootPath, { recursive: true })
        const sopInstanceInstancePath = path.join(sopInstanceInstanceRootPath, sopInstanceUid)
        requestQueue.add({ sourceUri: sopInstanceRootUrl, outFilePath: sopInstanceInstancePath, options })
            .then((dump) => {
                if (dump.response.statusCode !== 200) {
                    fsasync.rm(sopInstanceInstanceRootPath, { recursive: true, force: true })
                    requestQueue.failed++
                    requestQueue.success--
                }
            }).catch((err) => {
                if (err.code !== 'ENOENT') {
                    console.log('zzz', err)
                }
            })
    }*/
}

export default dumpInstanceP10