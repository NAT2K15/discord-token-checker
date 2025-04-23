// Rate limiting middleware
const logger = require('./logger');
const config = require('../config')
const rateLimit = {
    // Store IP addresses and their request timestamps
    requestLog: {},
    // Store banned IPs and their ban expiry timestamps
    bannedIPs: {},

    // Middleware function to check rate limits
    middleware: function(req, res, next) {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();

        // Check if IP is banned
        if (this.bannedIPs[ip]) {
            if (now < this.bannedIPs[ip]) {
                // IP is still banned
                const remainingTime = Math.ceil((this.bannedIPs[ip] - now) / 1000 / 60);
                logger.ban(`IP still banned for ${remainingTime} minutes`, ip, `${remainingTime} minutes`);
                return res.status(429).json({
                    error: 'Too many requests',
                    message: `You are temporarily banned for ${remainingTime} minutes due to rate limit violations`
                });
            } else {
                // Ban has expired, remove from banned list
                delete this.bannedIPs[ip];
                // Reset request log for this IP
                delete this.requestLog[ip];
                logger.info(`Ban expired for IP: ${ip}`);
            }
        }

        // Initialize request log for this IP if it doesn't exist
        if (!this.requestLog[ip]) {
            this.requestLog[ip] = {
                lastRequest: 0,
                violations: 0
            };
        }

        // Check if request is too soon after the last one
        // Convert seconds to milliseconds for comparison
        if (now - this.requestLog[ip].lastRequest < (config.api.rateLimit.requestInterval * 1000)) {
            // Increment violation count
            this.requestLog[ip].violations++;
            
            // Check if user should be banned
            if (this.requestLog[ip].violations >= config.api.rateLimit.maxViolations) {
                // Ban the IP (convert minutes to milliseconds)
                this.bannedIPs[ip] = now + (config.api.rateLimit.banDuration * 60 * 1000);
                const banDurationMinutes = config.api.rateLimit.banDuration;
                
                logger.ban(`IP banned for rate limit violations`, ip, `${banDurationMinutes} minutes`);
                
                return res.status(429).json({
                    error: 'Too many requests',
                    message: `You have been temporarily banned for ${banDurationMinutes} minutes due to rate limit violations`
                });
            }
            
            logger.rateLimit(`Rate limit violation ${this.requestLog[ip].violations}/${config.api.rateLimit.maxViolations}`, ip);
            
            return res.status(429).json({
                error: 'Too many requests',
                message: `Please wait ${Math.ceil(config.api.rateLimit.requestInterval)} seconds between requests`,
                violations: this.requestLog[ip].violations,
                maxViolations: config.api.rateLimit.maxViolations
            });
        }

        // Update last request time
        this.requestLog[ip].lastRequest = now;
        
        // If user is respecting the rate limit, gradually reduce violation count
        if (this.requestLog[ip].violations > 0 && now - this.requestLog[ip].lastRequest > (config.api.rateLimit.requestInterval * 1000 * 2)) {
            this.requestLog[ip].violations--;
            logger.info(`Reduced violation count for IP: ${ip} to ${this.requestLog[ip].violations}`);
        }

        // Continue to the next middleware/route handler
        next();
    }
};

module.exports = rateLimit;
