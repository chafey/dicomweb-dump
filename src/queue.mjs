import Queue from 'promise-queue'

let queue = new Queue(Infinity, Infinity)

let promises = new Set()

const init = (maxConcurrent) => {
    queue = new Queue(maxConcurrent, Infinity)
}

const add = (fn) => {
    const promise = queue.add(fn)
    promises.add(promise)
    promise.finally(() => {
        console.log('before promise delete', promises.size, 'left')
        promises.delete(promise)
        console.log('after promise delete', promises.size, 'left')
    })
    return promise
}

const empty = async () => {
    //console.log(queue)
    do {
        console.log(promises.size)
        await Promise.all(Array.from(promises))
    } while (promises.size > 0)
    //console.log(queue.queue.length, queue.pendingPromises)
}

const clear = () => {

}


export default {
    init,
    add,
    empty,
    clear
}