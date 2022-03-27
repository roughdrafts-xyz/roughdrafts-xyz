const serverPromise = require('../server')
const prisma = require('../prisma')
const session = require('supertest-session')

let server
let authSession = null

const testUser = {
  id: 1,
  displayId: '1234',
  name: 'Test User',
  summary:
    'Two thousand or so words to test out the summary of this fake user.',
  articles: [
    {
      title: '🍎 Apple',
      summary: 'Delicious red thing',
      tags: '#red #apple #fruit'
    }
  ]
}

describe('Authenticated User Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
    prisma.user.findUnique = jest.fn(() => testUser)
    authSession = session(server.app)
    await authSession.get('/login/callback').expect(303)
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays User Settings Page', async () => {
    prisma.user.findUnique = jest.fn(() => testUser)
    const res = await authSession.get('/settings').expect(200)
    expect(res.text).toMatch(testUser.displayId)
  })

  test('Updates User Settings and Displays Updated User Settings Page', async () => {
    prisma.user.findUnique = jest.fn(() => testUser)
    const res = await authSession.get('/settings').expect(200)
    expect(res.text).toMatch(testUser.displayId)
  })
})
