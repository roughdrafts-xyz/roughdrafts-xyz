const request = require('supertest')
const serverPromise = require('../server')
const prisma = require('../prismaMock')

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

  test.todo(
    'login todos should actually mock and try out different login states'
  )
  test.todo('login needs to actually use Discord Oauth magic')
  test('does login callback with new user', async () => {
    // loginCallback()
    // needs Discord oauth magic
    prisma.user.findUnique = jest.fn(() => null)
    prisma.user.create = jest.fn(() => ({ displayId: '1234' }))
    await request(server.app)
      .get('/login/callback')
      .expect(303)
  })

  test('does login callback with existing user', async () => {
    // loginCallback()
    // needs Discord oauth magic
    prisma.user.findUnique = jest.fn(() => null)
    await request(server.app)
      .get('/login/callback')
      .expect(303)
  })

  test('does logout callback', async () => {
    // logout()
    await request(server.app)
      .get('/login/callback')
      .expect(303)
  })
})
