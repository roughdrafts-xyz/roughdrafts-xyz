const { PrismaClient } = jest.createMockFromModule('@prisma/client')
const prisma = new PrismaClient()
module.exports = prisma
