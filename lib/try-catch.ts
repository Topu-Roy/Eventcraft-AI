// Types for the result object with discriminated union
type Success<T> = {
  data: T
  error: null
}

type Failure<E> = {
  data: null
  error: E
}

type Result<T, E = Error> = Success<T> | Failure<E>

/**
 * Wraps a promise or async function in a try/catch and returns a discriminated union result.
 *
 * Eliminates the need for explicit try/catch blocks, making async code more readable
 * and easier to reason about. The returned result object has either `data` (on success)
 * or `error` (on failure), never both.
 *
 * @example
 * ```ts
 * // With a promise
 * const result = await tryCatch(fetchUser(id))
 * if (result.error) {
 *   toast.error(result.error.message)
 *   return
 * }
 * const user = result.data // properly typed
 *
 * // With a function (lazy evaluation)
 * const result = await tryCatch(() => expensiveAsyncOperation())
 * ```
 *
 * @param promiseOrFn - A Promise to await, or a function that returns a Promise.
 *   Use a function when the promise should only be created inside the try block
 *   (e.g., to avoid unhandled rejection warnings).
 * @returns A Result object — either `{ data: T, error: null }` or `{ data: null, error: Error }`.
 */
export async function tryCatch<T>(promiseOrFn: Promise<T> | (() => Promise<T>)): Promise<Result<T>> {
  try {
    const promise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn
    const data = await promise
    return { data, error: null }
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error occurred")

    return { data: null, error: errorObj }
  }
}
