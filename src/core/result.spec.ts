import { Result, failure, success } from './result'

function doSomething(shouldSuccess: boolean): Result<string, number> {
  if (shouldSuccess) return success(10)
  else return failure('error')
}

test('success result', () => {
  const result = doSomething(true)

  expect(result.isSuccess()).toBe(true)
  expect(result.isFailure()).toBe(false)
})

test('error result', () => {
  const result = doSomething(false)

  expect(result.isFailure()).toBe(true)
  expect(result.isSuccess()).toBe(false)
})
