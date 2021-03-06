import getUrlToStream from './getUrlToStream.mjs'
import { promises as fsasync } from 'fs'
import fs from 'fs'

const getAndWrite = async (sourceUri, outFilePath, options) => {
    try {
        const writeStream = fs.createWriteStream(outFilePath)
        const dump = await getUrlToStream(sourceUri, writeStream, options)
        await fsasync.writeFile(outFilePath + '.dump.json', JSON.stringify(dump, null, 2))
        return dump
    }
    catch (err) {
        await fsasync.unlink(outFilePath)
        throw err
    }
}

export default getAndWrite