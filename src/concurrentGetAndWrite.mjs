import getAndWrite from './getAndWrite2.mjs'
import queue from './queue.mjs'

const concurrentGetAndWrite = (sourceUri, outFilePath, options) => {
    return queue.add(() => {
        return getAndWrite(sourceUri, outFilePath, options)
    })
}

export default concurrentGetAndWrite