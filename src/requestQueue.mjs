function RequestQueue(executor, maxPending = 1) {
    this.executor = executor
    this.queue = []
    this.pending = new Set()
    this.maxPending = maxPending
    this.promises = new Set()
    this.completed = 0
    this.failed = 0
}

RequestQueue.prototype.add = function (request) {
    const self = this
    const promise = new Promise((resolve, reject) => {
        self.queue.push({
            request,
            resolve,
            reject
        })
    })
    self.promises.add(promise)
    promise.then(() => {
        self.completed++
    }).catch(() => {
        self.failed++
    }).finally(() => {
        self.promises.delete(promise)
    })
    return promise
}

RequestQueue.prototype._dequeue = async function () {
    const self = this
    // if queue is empty, nothing to do so return immediately
    if (!self.queue.length) {
        return
    }

    // if we have more pending entries than max allowed, return immediately
    if (self.pending.size >= self.maxPending) {
        return
    }

    // we have room for another request, remove it from queue list and add it to pending
    const queueItem = self.queue.shift()
    self.pending.add(queueItem)

    // perform the request
    try {
        const result = await self.executor(queueItem.request)
        //console.log('result=', result)
        queueItem.resolve(result)
    }
    catch (err) {
        // error occured, return it via rejected promise
        queueItem.reject(err)
    }
    finally {
        // remove from pending list and try to dequeue the next entry
        self.pending.delete(queueItem)
        self._dequeue()
    }

}

RequestQueue.prototype.empty = async function () {
    const self = this

    return new Promise((resolve, reject) => {
        const runMore = async () => {
            if (self.promises.size === 0) {
                resolve()
            } else {
                const numToStart = (self.maxPending - self.pending.size)
                const promises = Array.from(self.pending)
                for (let i = 0; i < numToStart; i++) {
                    promises.push(self._dequeue())
                }
                try {
                    await Promise.any(promises)
                } catch (err) {
                    console.log(err)
                }
                setTimeout(runMore, 0)
            }
        }
        setTimeout(runMore, 0)
    })
}
RequestQueue.prototype.stats = function () {
    const self = this
    return {
        queued: self.queue.length,
        pending: self.pending.size,
        completed: self.completed,
        failed: self.failed
    }
}

export default RequestQueue