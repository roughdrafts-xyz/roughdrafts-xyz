# Project

Project Description

<!--Pull individual Views IDLY into the "In Progress" and break down the stuff in parens into individual list items when working on them-->
<!-- Testing tutorial https://www.albertgao.xyz/2017/05/24/how-to-test-expressjs-with-jest-and-supertest/ -->
<!-- Prisma has a jest mock https://www.prisma.io/docs/guides/testing/unit-testing -->

### Todo

### Views I don't like yet

### Won't do X

- Add styling to update and error reporting
- BUG > Title and Name can be blank because '' is a proper string. Normalize data with a middleware? (required field is good enough)
- List of Articles (Needs link to User Settings, search functions, and filtering. Like tags & published status.) - (Most of this is done, everything else is just v2)
- Raw Page (Don't know how it actually feels to access) - (This is essentially a kind error page, it can be improved in v2)
- New User Page (Should explain the formatting and have better nav) - (This is getting axed)
- Setup visibility on articles to be an ENUM (ENUMs are a lot more limited than expected, just added a shim)

### Done ✓

- Article Settings (Needs to handle published mode, title, summary, and imply rbac stuff. Also needs ability to delete article. Might need ability to transfer article ownership?)
- Swap to Server JS
- Organize functions and files
- See if theres a view thats just template literals
- Find a testing suite (Jest?)
- Prepare functions for unit testing
- Edit Page (Needs to know if the user is logged in or not)
- User Settings (Needs to handle changing display name and vanity settings and allow downloading notes)
- BUG Editing need hidden for title or something.
- Add update and error reporting to settings pages
- Add input verification to settings pages
- Add update errors to setting updates
- Axe New User Page
- Add plugins to markdown-it
- Add Discord Oauth via Grant
- Welcome Page needs to explain the concept of what Rough Drafts is and look more presentable
- Setup Prisma to actually use mysql instead
- Prep Procfile and ENV for Piku needs
