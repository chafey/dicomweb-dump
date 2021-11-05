import getUrlToStream from './getUrlToStream.mjs'
import fs from 'fs'
import queue from './queue.mjs'

const concurrentGetAndWrite = (sourceUri, outFilePath, options) => {
    const writeStream = fs.createWriteStream(outFilePath)
    return queue.add(() => {
        return getUrlToStream(sourceUri, writeStream, options)
    })
}

export default concurrentGetAndWrite