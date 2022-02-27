const request = require('supertest')
const serverPromise = require('../server')

let server
describe('Authentication Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
  })

  afterAll(async () => {
    await server.close()
  })

  test('redirects login', async () => {
    // login()
    await request(server.app)
      .get('/login')
      .expect(303)
  })

  test('does login callback', () => {
    // loginCallback()
    // needs Discord oauth magic
    expect(false).toEqual(true)
  })

  test('does login callback', () => {
    // logout()
    expect(true).toEqual(true)
  })
})
