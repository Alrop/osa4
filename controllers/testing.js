const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken');
const helper = require("../utils/test_helper");



router.post('/reset', async (request, response) => {
    await Blog.deleteMany({})
    await User.deleteMany({})


    const logins = await helper.initialLogins()
    await User.insertMany(logins)

    const usersList = await helper.usersInDb()
    // console.log("List of testers ", usersList)
    const testUser = usersList[0]
    console.log("Tester name ", testUser)
    testToken = {
        username: testUser.username,
        id: testUser.id
    }
    unauthToken = {
        username: usersList[1].username,
        id: usersList[1].id
    }
    const blogsWithUsers = helper.initialBlogs.map(blog => ({ ...blog, user: testUser.id }))
    await Blog.insertMany(blogsWithUsers)


    response.status(204).end()
})

module.exports = router
