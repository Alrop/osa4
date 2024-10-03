const mongoose = require('mongoose')
const { after, before, beforeEach, describe, test, } = require('node:test')
const assert = require('node:assert')
const helper = require("../utils/test_helper");
const supertest = require('supertest')

const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken');


beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})

    const logins = await helper.initialLogins()
    await User.insertMany(logins)

    const usersList = await helper.usersInDb()
    // console.log("List of testers ", usersList)
    const testUser = usersList[0]
    // console.log("Tester name ", testUser)
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
})

describe("Check blog inits", { only: false }, () => {
    test('blogs are returned as json', async () => {
        await api.get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test("blogs has value of id, but no _id", async () => {
        const response = await helper.blogsInDb()
        response.forEach((blog) => {
            assert.equal(blog._id, undefined)
            assert.ok(blog.id, true)
        })
    })
})


describe("handle incomplete entries", { only: false }, () => {

    test("POST rejects inputs missing title", { only: false }, async () => {
        const testUser = jwt.sign(testToken, process.env.SECRET)
        const noTitle = {
            author: "John Doe",
            url: "https://404.com/",
            likes: 4,
        };
        await api
            .post("/api/blogs")
            .send(noTitle)
            .set("Authorization", `Bearer ${testUser}`)
            .expect(400)
        const response = await helper.blogsInDb()
        assert.strictEqual(response.length, helper.initialBlogs.length);
    })

    test("POST rejects inputs missing url", async () => {
        const testUser = jwt.sign(testToken, process.env.SECRET)
        const noUrl = {
            author: "John Doe",
            title: "Deerless planes",
            likes: 4,
        };
        await api
            .post("/api/blogs")
            .send(noUrl)
            .set("Authorization", `Bearer ${testUser}`)
            .expect(400)
        const response = await helper.blogsInDb()
        assert.strictEqual(response.length, helper.initialBlogs.length);
    })

    test("missing likes defaults to 0", async () => {
        const testUser = jwt.sign(testToken, process.env.SECRET)
        const newBlog = {
            title: "To become anonymoose",
            author: "John Doe",
            url: "https://404.com/",
        };
        const response = await api
            .post("/api/blogs")
            .send(newBlog)
            .set("Authorization", `Bearer ${testUser}`)
            .expect(201)

        assert.strictEqual(response.body.likes, 0);
    })
})


describe("authentication checks", { only: false }, () => {

    test("auth can post", { only: false }, async () => {
        const testUser = jwt.sign(testToken, process.env.SECRET)
        const newBlog = {
            title: "From blogger to logger",
            author: "John Doe",
            url: "https://404.com/",
            likes: 4,
        }
        await api
            .post("/api/blogs")
            .send(newBlog)
            .set("Authorization", `Bearer ${testUser}`)
            .expect(201)
            .expect("Content-Type", /application\/json/)
        const response = await helper.blogsInDb()
        // console.log(response)

        assert.strictEqual(response.length, helper.initialBlogs.length + 1)
    })
    test("non-auth can't post", { only: false }, async () => {
        const newBlog = {
            title: "From blogger to logger",
            author: "John Doe",
            url: "https://404.com/",
            likes: 4,
        }
        await api
            .post("/api/blogs")
            .send(newBlog)
            .expect(401)
            .expect("Content-Type", /application\/json/)
        const response = await helper.blogsInDb()
        // console.log(response)

        assert.strictEqual(response.length, helper.initialBlogs.length)
    })

    test("blog can be updated", async () => {
        const testUser = jwt.sign(testToken, process.env.SECRET)
        const blogs = await api.get("/api/blogs")
        const updatedBlog = {
            title: "updatedTitle",
            author: "updatedAuthor",
            url: "https://updatedURL.com/",
            likes: 10
            , user: {
                username: 'mrTest',
                name: 'Test Testson',
                id: '66fb4df22dcd10757ed69499'
            }
        };
        await api
            .put(`/api/blogs/${blogs.body[0].id}`)
            .send(updatedBlog)
            .set("Authorization", `Bearer ${testUser}`)


        let res = await api.get("/api/blogs")
        // console.log(updatedBlog)
        delete res.body[0].id
        assert.deepStrictEqual(res.body[0].title, updatedBlog.title);
    })

    test("auth can be deleted", { only: false }, async () => {
        const testUser = jwt.sign(testToken, process.env.SECRET)
        const blogsAtStart = await helper.blogsInDb();
        const blogToDelete = blogsAtStart[0];
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set("Authorization", `Bearer ${testUser}`)
            .expect(204)
        const reponse = await helper.blogsInDb()
        assert.strictEqual(reponse.length, helper.initialBlogs.length - 1);
    })
})
test("non-auth can't delete", { only: false }, async () => {
    const testUser = jwt.sign(unauthToken, process.env.SECRET)
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${testUser}`)
        .expect(401)
    const reponse = await helper.blogsInDb()
    assert.strictEqual(reponse.length, helper.initialBlogs.length);
})


after(async () => {
    await mongoose.connection.close()
})