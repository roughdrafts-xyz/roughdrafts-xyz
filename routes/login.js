get('/login', async ctx => {
	// oauth2 bullshit
	// oauth does this redirect normally
	if (ctx.session.user) {
		return redirect(`/@${ctx.session.user.displayId}`)
	} else {
		return redirect('/login/callback')
	}
}),
	get('/login/callback', async ctx => {
		// this should be a post normally
		// https://github.com/jaredhanson/passport-oauth2 This supports scope, its just not a documented option

		// idk discord is probably going to want this tho
		const discordId = '1235'
		const discordName = 'Sum Guy'
		let user = await prisma.user.findUnique({ where: { discordId } })
		let isNew = false
		if (!user) {
			user = await prisma.user.create({
				data: {
					discordId,
					displayId: await nanoid(),
					profile: {
						create: {
							name: discordName
						}
					}
				}
			})
			isNew = true
		}
		// ah shit we need cookies or something
		ctx.session.user = user
		if (isNew) {
			return redirect('/welcome')
		} else if (ctx.query.redirect) {
			return redirect(ctx.query.redirect)
		} else {
			return redirect(`/@${user.displayId}`)
		}
	}),
	get('/logout', async (request, reply) => {
		if (request.session.user) {
			request.destroySession(err => {
				if (err) {
					reply.status(500)
					reply.redirect('/error')
				} else {
					reply.redirect('/')
				}
			})
		} else {
			reply.redirect('/')
		}
	})
