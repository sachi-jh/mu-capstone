const { jwtVerify } = require('jose');

const SUPABASE_JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

async function authenticateUser(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const { payload } = await jwtVerify(token, SUPABASE_JWT_SECRET, {
            algorithms: ['HS256'],
        });
        req.user = payload;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

module.exports = authenticateUser;
