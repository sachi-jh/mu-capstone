const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

dotenv.config();
const server = express();
server.use(express.json());
server.use(cors());


/* --USER ROUTES--*/

// get user by ID including posts, trips, and wishlist
// might consider separating into different routes for each
server.get('/api/user/:user_id/profile', async (req, res, next) => {
    const user_id = parseInt(req.params.user_id);
    try {
        const user = await prisma.user.findUnique({where: {id: user_id}, include:{posts: true, trips: true, wishlist: true}});
        if (user) {
            res.json(user);
        } else {
            next({ status: 404, message: `User ${user_id} not found` });
        }
    } catch (err) {
        next(err);
    }
});


/* --PARK ROUTES-- */
// get all parks
server.get('/api/parks', async (req, res, next) => {
    try {
        const parks = await prisma.park.findMany({});
        if (parks.length) {
            res.json(parks);
        } else {
            next({ status: 404, message: "No parks found" });
        }
    } catch (err) {
        next(err);
    }
});

// get park by ID (NOT parkCode or name)
server.get('/api/parks/:park_id', async (req, res, next) => {
    const id = parseInt(req.params.park_id);
    try{
        const park = await prisma.park.findUnique({where: {id: id}});
        if (park) {
            res.json(park);
        } else {
            next({ status: 404, message: `Park ${id} not found` });
        }
    } catch (err) {
        next(err);
    }
});


/* --POST ROUTES-- */
// get all posts (like the entire table)
server.get('/api/posts', async (req, res, next) => {
    try {
        const posts = await prisma.post.findMany({});
        if (posts.length) {
            res.json(posts);
        } else {
            next({ status: 404, message: "No posts found" });
        }
    } catch (err) {
        next(err);
    }
});

// create a new post
server.post('/api/posts/newpost', async (req, res, next) => {
    const data = req.body;
    try {
        if (data) {
            const newPost = await prisma.post.create({data: data});
            res.status(201).json(newPost);
        } else {
            next({ status: 400, message: "No data provided" });
        }
    } catch (err) {
        next(err);
    }
});

/* --MIDDLEWARE-- */
// error handling middleware
server.use((req, res, next) => {
    next({ status: 404, message: "Not found" });
});

// Error handling middleware
server.use((err, req, res, next) => {
  const { message, status = 500 } = err;
  console.log(message);
  res.status(status).json({ message }); // Unsafe in prod
});


module.exports = server;
