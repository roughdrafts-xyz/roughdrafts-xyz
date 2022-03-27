const request = require('supertest')
const serverPromise = require('../server')
const prisma = require('../prisma')

let server

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

describe('User Handlers', () => {
  beforeAll(async () => {
    server = await serverPromise
  })

  afterAll(async () => {
    await server.close()
  })

  test('Displays User Page', async () => {
    prisma.user.findUnique = jest.fn(() => testUser)
    const res = await request(server.app)
      .get('/@1234')
      .expect(200)
    expect(res.text).toMatch(testUser.name)
  })
})
