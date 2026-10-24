import parallel from './parallel'

/**
 * A module whose dependencies are consumed one after another, in the order
 * they were added. Each one is consumed only once the previous one resolves.
 */
class SerialSyrup<T = unknown, B = unknown> extends parallel.Syrup<T, B> {
  // Only narrows the return type, so that a defined module is still typed as
  // a SerialSyrup.
  override define<R>(body: parallel.Body<R>): SerialSyrup<Awaited<R>, R> {
    return super.define(body) as SerialSyrup<Awaited<R>, R>
  }

  override consume(overrides?: object): Promise<T> {
    if (this.resolved) {
      return this.resolved
    }
    let cursor = 0
    const results: unknown[] = []
    // The length is read again on every step, and the first dependency is
    // consumed synchronously, like the original implementation.
    const next = (): PromiseLike<unknown[]> => {
      if (cursor < this.dependencies.length) {
        return this.dependencies[cursor++]!.consume(overrides).then(value => {
          results.push(value)
          return next()
        })
      }
      return Promise.resolve(results)
    }
    this.resolved = Promise.resolve(next()).then(
      results => this.invoke(overrides, ...results) as unknown as T
    )
    return this.resolved
  }
}

/**
 * Creates a module whose dependencies are consumed serially.
 */
function serial(options?: object | null): SerialSyrup {
  return new SerialSyrup(options)
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace serial {
  export const Syrup = SerialSyrup
  export type Syrup<T = unknown, B = unknown> = SerialSyrup<T, B>
}

export = serial
