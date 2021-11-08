import queue from '../src/queue.mjs'
import assert from 'assert'

const createPromise = () => {
    let result = {
        resolved: false,
        rejected: false,
    }
    result.promise = new Promise((resolve, reject) => {
        result.resolve = resolve
        result.reject = reject
    })
    result.promise.then(() => {
        result.resolved = true
    }).catch(() => {
        result.rejected = true
    })
    return result
}

describe('queue', async () => {

    it('happy path', async () => {
        // Arrange

        // Act
        const result = await queue.add(() => { return "hello" })

        // Assert
        assert.strictEqual(result, "hello")
    })

    it('queing', async () => {
        // Arrange
        queue.init(1)
        const p1 = createPromise()
        const p2 = createPromise()

        // Act
        queue.add(() => p1.promise)
        queue.add(() => p2.promise)

        // Assert
        assert.strictEqual(p1.resolved, false)
        assert.strictEqual(p2.resolved, false)
    })
    /*

    it('queing2', async () => {
        // Arrange
        queue.init(1)
        const p1 = createPromise()
        const p2 = createPromise()

        // Act
        queue.add(() => p1.promise)
        queue.add(() => p2.promise)
        p1.resolve()
        await p1

        // Assert
        assert.strictEqual(p1.resolved, true)
        assert.strictEqual(p2.resolved, false)
    })

    it('queing3', async () => {
        // Arrange
        queue.init(1)
        const p1 = createPromise()
        const p2 = createPromise()

        // Act
        queue.add(() => p1.promise)
        queue.add(() => p2.promise)
        p1.resolve()
        p2.resolve()
        await p2

        // Assert
        assert.strictEqual(p1.resolved, true)
        assert.strictEqual(p2.resolved, true)
    })

it('await', async () => {
  // Arrange
  queue.init(1)
  const p1 = createPromise()
  const p2 = createPromise()
 
  // Act
  queue.add(() => p1.promise)
  queue.add(() => p2.promise)
  p1.resolve()
  p2.resolve()
  await queue.empty()
 
  // Assert
  assert.strictEqual(p1.resolved, true)
  assert.strictEqual(p2.resolved, true)
})
 
it('await2', async () => {
  // Arrange
  queue.init(1)
  const p1 = createPromise()
  const p2 = createPromise()
  let queueEmpty = false
 
  // Act
  queue.add(() => p1.promise)
  queue.add(() => p2.promise)
  queue.empty().then(() => {
      queueEmpty = true
  })
  p1.resolve()
  await p1.promise
  queue.clear()
 
  // Assert
  assert.strictEqual(p1.resolved, true)
  assert.strictEqual(p2.resolved, false)
  assert.strictEqual(queueEmpty, false)
  p2.resolve()
})
*/
})
