// Created by NAT2K15 Development || https://store.nat2k15.xyz
const config = {
    port: 3000,
    api: {
        url: "/api",
        restricted: false,
        secretKey: "", // Secret key for API authentication in the body put code.
        rateLimit: {
            requestInterval: 3, // in seconds
            banDuration: 10, // in minutes
            maxViolations: 10 // max violations before ban
        }
    }
}

module.exports = config;