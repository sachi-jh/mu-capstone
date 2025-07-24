/* eslint-disable @stylistic/indent */
const express = require('express');
const cors = require('cors');
const prisma = require('./db.js');
const calculateParkScore = require('./recommender.js');
const generateItinerary = require('./itineraryGenerator.js');
const authenticateUser = require('./authMiddleware.js');
const server = express();
server.use(express.json());
server.use(cors());

//park
//mendor endpoint
server.post(
    '/api/parks/recommend',
    authenticateUser,
    async (req, res, next) => {
        const userInput = req.body;
        const user_id = req.user.sub;

        try {
            const user = await prisma.user.findUnique({
                where: { authUserId: user_id },
                include: { wishlist: true, visited: true, reviews: true },
            });
            if (!user) {
                next({ status: 404, message: `User ${user_id} not found` });
            }
            const parkData = await prisma.park.findMany({});
            if (!parkData.length) {
                next({ status: 404, message: 'Error fetching parks' });
            }
            const recommendedParkRankings = await calculateParkScore(
                parkData,
                userInput,
                user.wishlist,
                user.visited,
                user.reviews
            );
            res.json(recommendedParkRankings);
        } catch (err) {
            next(err);
        }
    }
);

/* --USER ROUTES--*/

// Get user by ID including posts, trips, and wishlist
// Might consider separating into different routes for each
server.get('/api/user/:user_id/profile', async (req, res, next) => {
    const user_id = req.params.user_id;
    try {
        const user = await prisma.user.findUnique({
            where: { authUserId: user_id },
            include: {
                posts: true,
                trips: { include: { location: true } },
                wishlist: true,
                visited: true,
                reviews: true,
            },
        });
        if (user) {
            res.json(user);
        } else {
            next({ status: 404, message: `User ${user_id} not found` });
        }
    } catch (err) {
        next(err);
    }
});

server.get('/api/user/:user_id/info-id', async (req, res, next) => {
    const user_id = parseInt(req.params.user_id);
    try {
        const user = await prisma.user.findUnique({
            where: { id: user_id },
            include: {
                posts: true,
                trips: { include: { location: true } },
                wishlist: true,
                visited: true,
                reviews: true,
            },
        });
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
        const user = await prisma.user.findUnique({
            where: { authUserId: user_id },
            include: { trips: { include: { location: true } } },
        });
        if (!user) {
            return next({ status: 404, message: `User ${user_id} not found` });
        } else if (!user.trips || user.trips.length === 0) {
            return next({ status: 204, message: 'No trips added' });
        }
        res.json(user.trips);
    } catch (err) {
        next(err);
    }
});

server.patch(
    '/api/user/edit-profile',
    authenticateUser,
    async (req, res, next) => {
        const user_id = req.user.sub;
        const { name, userLocationLat, userLocationLong, bio } = req.body;
        const invalidData =
            name == undefined &&
            userLocationLat == undefined &&
            userLocationLong == undefined &&
            bio == undefined;
        if (invalidData) {
            next({ status: 422, message: 'Invalid data' });
        }
        try {
            const user = await prisma.user.update({
                where: { authUserId: user_id },
                data: {
                    name: name,
                    userLocationLat: userLocationLat,
                    userLocationLong: userLocationLong,
                    bio: bio,
                },
            });
            res.status(200).json({
                message: `Updated user ${user_id} profile`,
            });
        } catch (err) {
            next(err);
        }
    }
);

server.patch('/api/user/update-wishlist', async (req, res, next) => {
    const { userId, parkId, status } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { authUserId: userId },
        });
        if (!user) {
            next({ status: 404, message: `User ${userId} not found` });
        }
        const park = await prisma.park.findUnique({ where: { id: parkId } });
        if (!park) {
            next({ status: 404, message: `Park ${parkId} not found` });
        }
        // remove to ensure lists are mutually exclusive
        await prisma.user.update({
            where: { authUserId: userId },
            data: {
                wishlist: {
                    disconnect: { id: parkId },
                },
                visited: {
                    disconnect: { id: parkId },
                },
            },
        });

        if (status === 'wishlist') {
            await prisma.user.update({
                where: { authUserId: userId },
                data: {
                    wishlist: {
                        connect: { id: parkId },
                    },
                },
            });
        } else if (status === 'visited') {
            await prisma.user.update({
                where: { authUserId: userId },
                data: {
                    visited: {
                        connect: { id: parkId },
                    },
                },
            });
        }

        res.status(200).json({ message: `Updated park status to ${status}` });
    } catch (err) {
        next(err);
    }
});

server.post('/api/trips/newtrip', async (req, res, next) => {
    const { authorId, name, startDate, endDate, days, locationId } = req.body;
    try {
        const invalidData =
            authorId == undefined &&
            name == undefined &&
            days == undefined &&
            locationId == undefined;
        if (invalidData) {
            next({ status: 422, message: 'Invalid data' });
        }
        const newtrip = await prisma.trip.create({
            data: {
                name: name,
                days: days,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                author: {
                    connect: { id: Number(authorId) },
                },
                location: {
                    connect: { id: Number(locationId) },
                },
            },
        });

        res.status(201).json(newtrip);
    } catch (err) {
        next(err);
    }
});

server.post(`/api/trip/generate-trip`, async (req, res, next) => {
    const { authorId, name, startDate, endDate, days, locationId, activities } =
        req.body;
    try {
        const invalidData =
            authorId == undefined &&
            name == undefined &&
            days == undefined &&
            locationId == undefined &&
            activities == undefined;
        if (invalidData) {
            next({ status: 422, message: 'Invalid data' });
        }
        const newtrip = await prisma.trip.create({
            data: {
                name: name,
                days: days,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                author: {
                    connect: { id: Number(authorId) },
                },
                location: {
                    connect: { id: Number(locationId) },
                },
            },
        });
        const newItinerary = await generateItinerary({
            duration: days,
            park: locationId,
            activities: activities,
            tripId: newtrip.id,
        });
        const newActivities = await prisma.thingstodoOnTrips.createMany({
            data: newItinerary
                .filter(
                    (activity) =>
                        activity.thingsToDoID !== undefined &&
                        activity.day !== undefined &&
                        activity.startTime !== undefined &&
                        activity.endTime !== undefined &&
                        activity.durationMins !== undefined
                )
                .map((activity) => ({
                    tripId: newtrip.id,
                    thingstodoId: activity.thingsToDoID,
                    tripDay: activity.day,
                    startTime: activity.startTime,
                    endTime: activity.endTime,
                    durationMins: activity.durationMins,
                })),
        });
        res.status(201).json(newtrip);
    } catch (err) {
        next(err);
    }
});

// Get trip details by trip ID
server.get('/api/trips/:trip_id', async (req, res, next) => {
    const trip_id = parseInt(req.params.trip_id);
    try {
        const trip = await prisma.trip.findUnique({ where: { id: trip_id } });
        if (!trip) {
            next({ status: 404, message: `Trip ${trip_id} not found` });
        }
        res.json(trip);
    } catch (err) {
        next(err);
    }
});

// Get activities associated with a specific park **passes park id in the body?
server.get('/api/parks/:park_id/activities', async (req, res, next) => {
    const park_id = parseInt(req.params.park_id);
    const park = await prisma.park.findUnique({ where: { id: park_id } });
    if (!park) {
        next({ status: 404, message: `Park ${park_id} not found` });
    }
    try {
        const activities = await prisma.thingstodo.findMany({
            where: { locationId: park_id },
        });
        if (!activities) {
            next({ status: 204, message: 'No activities at this park' });
        }
        res.json(activities);
    } catch (err) {
        next(err);
    }
});

server.get('/api/parks/visitors-min-max', async (req, res, next) => {
    try {
        const minMaxVisitors = await prisma.park.aggregate({
            _min: {
                spring_avg_visitors: true,
                summer_avg_visitors: true,
                fall_avg_visitors: true,
                winter_avg_visitors: true,
            },
            _max: {
                spring_avg_visitors: true,
                summer_avg_visitors: true,
                fall_avg_visitors: true,
                winter_avg_visitors: true,
            },
        });
        res.status(200).json(minMaxVisitors);
    } catch (err) {
        next(err);
    }
});

server.post('/api/activities/save', async (req, res, next) => {
    const {
        tripId,
        activities, // Array of new activities to create
    } = req.body;

    try {
        if (!tripId || !activities || !Array.isArray(activities)) {
            return next({ status: 422, message: 'Invalid data' });
        }
        const tripIdNum = Number(tripId);
        await prisma.thingstodoOnTrips.deleteMany({
            where: {
                tripId: tripIdNum,
            },
        });
        const newActivities = await prisma.thingstodoOnTrips.createMany({
            data: activities.map((activity) => ({
                tripId: tripIdNum,
                thingstodoId: activity.thingsToDoID,
                tripDay: activity.day,
                startTime: activity.startTime,
                endTime: activity.endTime,
                durationMins: activity.durationMins,
            })),
        });

        res.status(200).json(newActivities);
    } catch (err) {
        next(err);
    }
});

server.post('/api/activities/newactivity', async (req, res, next) => {
    const { tripId, thingstodoId, day, time } = req.body;
    const invalidData =
        tripId == undefined &&
        thingstodoId == undefined &&
        day == undefined &&
        time == undefined;
    if (invalidData) {
        next({ status: 422, message: 'Invalid data' });
    }
    const existing = await prisma.thingstodoOnTrips.findUnique({
        where: {
            thingstodoId_tripId: {
                thingstodoId: Number(thingstodoId),
                tripId: Number(tripId),
            },
        },
    });

    if (existing) {
        return next({
            status: 409,
            message: 'Activity already added to this trip.',
        });
    }
    try {
        const newActivity = await prisma.thingstodoOnTrips.create({
            data: {
                trip: { connect: { id: Number(tripId) } },
                thingstodo: { connect: { id: Number(thingstodoId) } },
                tripDay: day,
                timeOfDay: time,
            },
        });
        res.status(201).json(newActivity);
    } catch (err) {
        next(err);
    }
});

server.put('/api/activities/updateactivity', async (req, res, next) => {
    const { tripId, thingstodoId, day, time } = req.body;
    const invalidData =
        tripId == undefined &&
        thingstodoId == undefined &&
        day == undefined &&
        time == undefined;
    if (invalidData) {
        next({ status: 422, message: 'Invalid data' });
    }

    try {
        const newActivity = await prisma.thingstodoOnTrips.update({
            where: {
                thingstodoId_tripId: {
                    thingstodoId: Number(thingstodoId),
                    tripId: Number(tripId),
                },
            },
            data: {
                tripDay: Number(day),
                timeOfDay: time,
            },
        });
        res.status(201).json(newActivity);
    } catch (err) {
        next(err);
    }
});

server.get('/api/activities/:trip_id', async (req, res, next) => {
    const trip_id = parseInt(req.params.trip_id);
    try {
        const activities = await prisma.thingstodoOnTrips.findMany({
            where: { tripId: trip_id },
            include: { thingstodo: true },
        });
        if (!activities) {
            next({ status: 204, message: 'No activities added' });
        }
        res.json(activities);
    } catch (err) {
        next(err);
    }
});

server.get('/api/activity-types', async (req, res, next) => {
    try {
        const activityTypes = await prisma.activityType.findMany({});
        if (!activityTypes) {
            next({ status: 404, message: 'No activity types found' });
        }
        res.json(activityTypes);
    } catch (err) {
        next(err);
    }
});

/* --PARK ROUTES-- */
// Get all parks
server.get('/api/parks', async (req, res, next) => {
    try {
        const parks = await prisma.park.findMany({ orderBy: { id: 'asc' } });
        if (parks.length) {
            res.json(parks);
        } else {
            next({ status: 204, message: 'No parks added' });
        }
    } catch (err) {
        next(err);
    }
});

// Get park by ID (NOT parkCode or name)
server.get('/api/parks/:park_id', async (req, res, next) => {
    const id = parseInt(req.params.park_id);
    try {
        const park = await prisma.park.findUnique({
            where: { id: id },
            include: { thingsToDo: true },
        });
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
            next({ status: 204, message: 'No posts added' });
        }
    } catch (err) {
        next(err);
    }
});

// Create a new post
server.post('/api/posts/newpost', authenticateUser, async (req, res, next) => {
    const userId = req.user.sub;
    const data = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { authUserId: userId },
        });
        if (data) {
            const newPost = await prisma.post.create({
                data: {
                    text: data.text, // or name/details if you're renaming it
                    image_url: data.image_url ?? null,
                    author: {
                        connect: { id: user.id },
                    },
                    location: {
                        connect: { id: Number(data.locationId) },
                    },
                },
            });
            res.status(201).json(newPost);
        } else {
            next({ status: 400, message: 'No data provided' });
        }
    } catch (err) {
        next(err);
    }
});

server.post(
    '/api/posts/new-alert',
    authenticateUser,
    async (req, res, next) => {
        const userId = req.user.sub;
        const data = req.body;
        try {
            const user = await prisma.user.findUnique({
                where: { authUserId: userId },
            });
            if (data) {
                const newPost = await prisma.alert.create({
                    data: {
                        name: data.name,
                        description: data.description, // or name/details if you're renaming it
                        category: data.category,
                        author: {
                            connect: { id: user.id },
                        },
                        location: {
                            connect: { id: Number(data.locationId) },
                        },
                    },
                });
                res.status(201).json(newPost);
            } else {
                next({ status: 400, message: 'No data provided' });
            }
        } catch (err) {
            next(err);
        }
    }
);

server.post(
    '/api/posts/new-review',
    authenticateUser,
    async (req, res, next) => {
        const userId = req.user.sub;
        const data = req.body;
        try {
            const user = await prisma.user.findUnique({
                where: { authUserId: userId },
            });
            if (data) {
                const newPost = await prisma.review.create({
                    data: {
                        rating: Number(data.rating),
                        review: data.review, // or name/details if you're renaming it
                        author: {
                            connect: { id: user.id },
                        },
                        location: {
                            connect: { id: Number(data.locationId) },
                        },
                    },
                });
                res.status(201).json(newPost);
            } else {
                next({ status: 400, message: 'No data provided' });
            }
        } catch (err) {
            next(err);
        }
    }
);

server.post(
    '/api/posts/new-event',
    authenticateUser,
    async (req, res, next) => {
        const userId = req.user.sub;
        const data = req.body;
        try {
            const user = await prisma.user.findUnique({
                where: { authUserId: userId },
            });
            if (data) {
                const newPost = await prisma.event.create({
                    data: {
                        name: data.name,
                        startDate: data.startDate,
                        startTime: data.startTime,
                        endTime: data.endTime,
                        description: data.description, // or name/details if you're renaming it
                        category: data.category,
                        author: {
                            connect: { id: user.id },
                        },
                        location: {
                            connect: { id: Number(data.locationId) },
                        },
                    },
                });
                res.status(201).json(newPost);
            } else {
                next({ status: 400, message: 'No data provided' });
            }
        } catch (err) {
            next(err);
        }
    }
);

/* --MIDDLEWARE-- */
// Error handling middleware
server.use((req, res, next) => {
    next({ status: 404, message: 'Not found' });
});

// Error handling middleware
server.use((err, req, res, next) => {
    const { message, status = 500 } = err;
    console.log(message);
    res.status(status).json({ message });
});

module.exports = server;
