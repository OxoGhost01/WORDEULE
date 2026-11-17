export function createLocks() {
    const tails = new Map()

    return function exclusive(key, task) {
        const previous = tails.get(key) ?? Promise.resolve()
        const result = previous.then(task)
        const tail = result.catch(() => {})
        tails.set(key, tail)
        tail.then(() => {
            if (tails.get(key) === tail) tails.delete(key)
        })
        return result
    }
}

export const handle = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res)).catch(next)
}
