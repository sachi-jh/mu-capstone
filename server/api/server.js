const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const { createClient } = require('@supabase/supabase-js');
const url = "https://wvmxtvzlnazeamtfoksk.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2bXh0dnpsbmF6ZWFtdGZva3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Mzc1NjIsImV4cCI6MjA2NjMxMzU2Mn0.k-PEEYExt4eS0ZTAkfNFYTuPQ0-9jArnX0UTh8V8rnw";
dotenv.config();
const server = express();
server.use(express.json());
server.use(cors());

const supabase = createClient(url, key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

// Create new user endpoint
server.post('/api/auth/register', async (req, res, next) => {
    const {email, password, name} = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                  name: name,
                }
              }
        });
        if (error) {
            next({ status: 400, message: error.message });
        }
        res.json(data);
        console.log(data);
    } catch (err) {
        next(err);
    }
})

// Login endpoint
server.post('/api/auth/login', async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        if (error) {
            next({ status: 400, message: error.message });
        }
        res.json(data);
        console.log(data);
    } catch (err) {
        next(err);
    }
})

// Logout endpoint --> not sure if this is needed/doesn't work
server.post('/api/auth/logout', async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            next({ status: 400, message: error.message });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
})

/* --USER ROUTES--*/

// Get user by ID including posts, trips, and wishlist
// ***might consider separating into different routes for each
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

// Get trips info by user UUID
server.get('/api/user/:user_id/trips', async (req, res, next) => {
    const user_id = req.params.user_id;
    try {
        const user = await prisma.user.findUnique({where: {authUserId: user_id}, include:{trips: true}});
        if (user) {
            res.json(user);
        } else {
            next({ status: 204, message: `User ${user_id} not found` });
        }
    } catch (err) {
        next(err);
    }
})


/* --PARK ROUTES-- */
// Get all parks
server.get('/api/parks', async (req, res, next) => {
    try {
        const parks = await prisma.park.findMany({ });
        if (parks.length) {
            res.json(parks);
        } else {
            next({ status: 204, message: "No parks added" });
        }
    } catch (err) {
        next(err);
    }
});

// Get park by ID (NOT parkCode or name)
server.get('/api/parks/:park_id', async (req, res, next) => {
    const id = parseInt(req.params.park_id);
    try{
        const park = await prisma.park.findUnique({where: {id: id}, include: { thingsToDo: true}});
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
// Get all posts (like the entire table)
server.get('/api/posts', async (req, res, next) => {
    try {
        const posts = await prisma.post.findMany({});
        if (posts.length) {
            res.json(posts);
        } else {
            next({ status: 204, message: "No posts added" });
        }
    } catch (err) {
        next(err);
    }
});

// Create a new post
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
// Error handling middleware
server.use((req, res, next) => {
    next({ status: 404, message: "Not found" });
});

// Error handling middleware
server.use((err, req, res, next) => {
  const { message, status = 500 } = err;
  console.log(message);
  res.status(status).json({ message });
});


module.exports = server;
