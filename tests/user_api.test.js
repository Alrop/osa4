const mongoose = require("mongoose")
const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const supertest = require("supertest")
const bcrypt = require("bcrypt")
const app = require("../app")
const api = supertest(app)
const helper = require("../utils/test_helper.js")
const User = require("../models/user")
const Blog = require("../models/blog")




beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})
    // const passwordHash = await bcrypt.hash("password", 10);
    // const user = new User({ username: "root", passwordHash });
    // await user.save()

    await Blog.insertMany(helper.initialBlogs)
    blogsList = await helper.blogsInDb()

    const logins = await helper.initialLogins()



    const userWithBlogs = logins.map(user => ({ ...user, blogs: blogsList[0].id }))
    await User.insertMany(userWithBlogs)

})


describe('Check user init', () => {
    test("GET initial user", { only: false }, async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const res = await api.get("/api/users")
        assert.strictEqual(res.body.length, helper.initialUsers.length)
    })

    test('Add new users', { only: false }, async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Testust',
            name: 'Test Testson',
            password: 'nostset',
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        const usersAtEnd = await helper.usersInDb()
        // console.log(usersAtEnd)
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
        assert.strictEqual(usersAtEnd[usersAtEnd.length - 1].username, newUser.username)
    })

    test('Fail if username exists', { only: false }, async () => {
        const newUser = {
            username: helper.initialUsers[0].username,
            name: helper.initialUsers[0].name,
            password: helper.initialUsers[0].passwordHash
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
        const usersAtEnd = await helper.usersInDb()

        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test('Fail username shorter than 3 characters', { only: false }, async () => {
        const newUser = {
            username: 'Te',
            name: 'Tes',
            password: 'nostset',
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)

        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })

    test("Passwords under 6 characters fails", async () => {
        const newUser = {
            username: 'Testust',
            name: 'Test Testson',
            password: 'te',
        }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
        const usersAtEnd = await helper.usersInDb()
        assert.strictEqual(usersAtEnd.length, helper.initialUsers.length)
    })
})


after(async () => {
    await mongoose.connection.close()
})