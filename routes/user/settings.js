get('/settings', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return null
  // Expose download link to personal sqlite db
  reply.send(views.userSettings(user))
})

post('/settings', async (request, reply) => {
  const { id } = request.session.user
  if (!id) return null
  const { displayId } = request.body
  const user = await prisma.user.update({ where: id, data: { displayId } })
  // do settings updates
  reply.send(views.userSettings(user))
})
