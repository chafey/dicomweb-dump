import Queue from 'promise-queue'
import assert from 'assert'

const sleepAndResolve = (msToSleep) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, msToSleep)
    })
}

const sleepAndReject = (msToSleep) => {
    return new Promise((resolve, reject) => {
        setTimeout(reject, msToSleep)
    })
}

describe('promise-queue', async () => {

    it('happy path', async () => {
        // Arrange
        const queue = new Queue(1, 15);
        let rejectCount = 0
        let resolveCount = 0
        // Act
        queue.add(() => {
            return sleepAndReject(10)
        }).then(() => { resolveCount++ }).catch(() => { rejectCount++ })
        await queue.add(() => {
            return sleepAndResolve(10)
        }).then(() => { resolveCount++ }).catch(() => { rejectCount++ })

        // Assert
        assert.strictEqual(rejectCount, 1)
        assert.strictEqual(resolveCount, 1)
    })
})
