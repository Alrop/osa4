const _ = require("lodash");

const dummy = () => {
    return (1)
}

const totalLikes = (blogs) => {
    result = blogs.reduce((total, blog) => total + blog.likes, 0)
    return (result)
}

const favouriteBlog = (blogs) => {
    result = blogs[0]
    for (let i = 0; i < blogs.length; i++) {
        if (blogs[i].likes > result.likes) {
            result = blogs[i]
        }
    }
    return (result)
}

const mostBlogs = (blogs) => {
    // console.log(blogs);
    const blogsPerAuthor = _.countBy(blogs, "author")
    // console.log(blogsPerAuthor)
    const mostProlific = _.maxBy(_.keys(blogsPerAuthor))
    // console.log(mostProlific, blogsPerAuthor[mostProlific])
    const result = { author: mostProlific, blogs: blogsPerAuthor[mostProlific] }
    return (result)
}

const mostLikes = (blogs) => {
    const blogsPerAuthor = _.groupBy(blogs, "author")
    // console.log(blogsPerAuthor)
    const likesPerAuthor = _.mapValues(blogsPerAuthor, totalLikes)
    // console.log(likesPerAuthor)
    const sortableList = []
    // Feels like below this could be compacted/smarter
    for (author in likesPerAuthor) {
        sortableList.push({ "author": author, "likes": likesPerAuthor[author] })
    }
    const sorted = _.orderBy(sortableList, "likes", ["desc"])
    const result = sorted[0]
    return (result)
}



module.exports = {
    dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes
}