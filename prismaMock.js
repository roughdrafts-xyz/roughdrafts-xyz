jest.enableAutomock()
const { PrismaClient } = require('@prisma/client')
let prisma = new PrismaClient()
beforeEach(() => {
  prisma = new PrismaClient()
})
jest.disableAutomock()
module.exports = prisma
