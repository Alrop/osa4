const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require('bcrypt')


const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    },
]
const initialUser = [
    {
        username: "mrTest",
        name: "Test Testson",
        passwordHash: "hash"
    },
]

const initialUsers = [
    {
        username: "mrTest",
        name: "Test Testson",
        passwordHash: "hash"
    },
    {
        username: "msTest",
        name: "Testina Testdotter",
        passwordHash: "mash"
    },
    {
        username: "drTest",
        name: "Doctor Tester",
        passwordHash: "dash"
    }
]

const initialLogins = async () => {
    const inits = initialUsers
    for (let user of inits) {
        const newHash = await bcrypt.hash(user.passwordHash, 10)
        user.passwordHash = newHash
    }
    return inits
}


const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}
const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

const nonExistingId = async () => {
    const blog = new Blog({
        title: "tempToBeRemoved",
        author: "John Doe",
        url: "http://www.test.tus",
        likes: 2
    })
    await blog.save();
    await blog.remove();
    return blog._id.toString()
}
module.exports = { initialBlogs, initialUser, initialUsers, initialLogins, nonExistingId, blogsInDb, usersInDb, }