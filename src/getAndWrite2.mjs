import getUrlToStream from './getUrlToStream.mjs'
import fs from 'fs'
import { promisify } from 'util'

const getAndWrite = (sourceUri, outFilePath, options) => {
    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(outFilePath)
        writeStream.on('error', (err) => {
            if (err) {
                writeStream.end()
                reject({
                    message: 'failed to create file ' + outFilePath,
                    err
                })
            }
        })
        getUrlToStream(sourceUri, writeStream, options).then((dump) => {
            fs.writeFile(outFilePath + '.dump.json', dump, (err) => {
                if (err) {
                    reject({
                        message: 'failed to create file ' + outFilePath + '.dump.json',
                        err
                    })
                }
                resolve(dump)
            })
        }).catch((err) => {
            fs.unlink(outFilePath, () => {
                reject(err)
            })
        })
    })
}

export default getAndWrite