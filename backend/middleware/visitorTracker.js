const geoip = require('geoip-lite');
const useragent = require('useragent');
const { pool } = require('../db');

const visitorTracker = async (req, res, next) => {
    try {
        // Get IP address
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        
        // Get browser info
        const userAgent = useragent.parse(req.headers['user-agent']);
        
        // Get geolocation data
        const geo = geoip.lookup(ip);
        
        // Prepare visitor data
        const visitorData = {
            ip: ip,
            browser: {
                family: userAgent.family,
                major: userAgent.major,
                minor: userAgent.minor,
                patch: userAgent.patch,
                os: userAgent.os.toString()
            },
            headers: {
                referer: req.headers.referer || null,
                language: req.headers['accept-language'] || null
            },
            timestamp: new Date().toISOString()
        };

        // Add region if available
        const region = geo ? `${geo.country}${geo.region ? `, ${geo.region}` : ''}` : null;

        // Insert into database
        await pool.query(
            'INSERT INTO visitorinfo (ip_address, region, data) VALUES ($1, $2, $3)',
            [ip, region, visitorData]
        );

        next();
    } catch (error) {
        console.error('Error tracking visitor:', error);
        // Continue with the request even if tracking fails
        next();
    }
};

module.exports = visitorTracker; 