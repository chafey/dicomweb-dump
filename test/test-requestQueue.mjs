import RequestQueue from '../src/requestQueue.mjs'
import assert from 'assert'

describe('RequestQueue', async () => {

    it('exector succeeds', async () => {
        // Arrange
        const executor = async (request) => {
            return request.message + '-executed'
        }
        const queue = new RequestQueue(executor)

        // Act
        const promise = queue.add({ message: 'hello' })
        await queue.empty()
        const result = await promise

        // Assert
        assert.strictEqual(result, 'hello-executed')
    })

    it('executor throws', async () => {
        // Arrange
        const executor = async (request) => {
            throw new Error('failure')
        }
        const queue = new RequestQueue(executor)

        // Act
        const promise = queue.add({ message: 'hello' })
        await queue.empty()

        assert.rejects(() => promise)
    })

    it('stats', async () => {
        // Arrange
        const executor = async (request) => {
            if (!request.success) {
                throw new Error('failed')
            }
        }
        const queue = new RequestQueue(executor)

        // Act
        queue.add({ success: true })
        queue.add({ success: false })
        const statsBefore = queue.stats()
        await queue.empty()
        const statsAfter = queue.stats()

        // Assert
        assert.strictEqual(statsBefore.queued, 2)
        assert.strictEqual(statsBefore.pending, 0)
        assert.strictEqual(statsBefore.completed, 0)
        assert.strictEqual(statsBefore.failed, 0)
        assert.strictEqual(statsAfter.queued, 0)
        assert.strictEqual(statsAfter.pending, 0)
        assert.strictEqual(statsAfter.completed, 1)
        assert.strictEqual(statsAfter.failed, 1)
    })

})
