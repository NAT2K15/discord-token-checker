// Created by NAT2K15 Development || https://store.nat2k15.xyz

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const cors = require('cors');
const config = require('./config');
const rateLimit = require('./src/rateLimit');
const logger = require('./src/logger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Enable trust proxy to get the client's real IP address when behind a proxy
app.set('trust proxy', true);

// Request logging middleware
app.use((req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
        logger.request(req.method, req.path, req.ip, res.statusCode);
        return originalSend.call(this, body);
    };
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Apply rate limiting to API endpoints
app.use(config.api.url, rateLimit.middleware.bind(rateLimit));
app.use('/check_token', rateLimit.middleware.bind(rateLimit));

app.get(config.api.url, async (req, res) => { 
    logger.info('API info endpoint accessed');
    let allowed = false;
    if(config.api.restricted) {
        const { code } = req.body;
        if(!code || code !== config.api.secretKey) {
            return res.status(401).json({
                valid: false,
                error: 'You are not authorized to access this endpoint.'
            });
        }
        allowed = true;
    }
    const { token } = req.body;
    if(!token) {
        return res.json({
            valid: false,
            error: "No token provided. Please include a token in the request body."
        })
    }
    
    let result = await checkToken(token);
    res.json(result);
});

app.post('/check_token', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        logger.warn('Token check attempted without providing a token');
        return res.json({ valid: false, error: 'No token provided' });
    }

    logger.info('Checking token validity');
    try {
        let result = await checkToken(token);
        res.json(result);  
    } catch (error) {
        logger.error('Token check error', error);
        const isInvalidToken = error.message === 'An invalid token was provided.';
        logger.tokenCheck(false, null);
        res.json({ 
            valid: false, 
            error: isInvalidToken 
                ? 'Invalid token' 
                : 'An error occurred while checking the token'
        });
    }
});

async function checkToken(token) {
    try {
        const client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.MessageContent
            ]
        });

        await client.login(token);
        
        // Wait for the client to be fully ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = client.user;
        const guilds = await client.guilds.fetch();

        const botInfo = {
            id: user.id,
            username: user.username || 'Unknown',
            avatar_url: user.displayAvatarURL({ dynamic: true, size: 512 }) || null,
            created_at: user.createdAt,
            is_bot: user.bot,
            is_verified: user.verified || false,
            guilds: []
        };

        // Fetch detailed guild information
        for (const [id, guild] of guilds) {
            try {
                const fullGuild = await guild.fetch();
                const memberCount = await fullGuild.memberCount;
                
                botInfo.guilds.push({
                    id: fullGuild.id,
                    name: fullGuild.name || 'Unknown Server',
                    icon_url: fullGuild.iconURL({ dynamic: true, size: 128 }) || null,
                    member_count: memberCount || 0,
                    owner_id: fullGuild.ownerId,
                    features: fullGuild.features || []
                });
            } catch (e) {
                console.error(`Error fetching guild ${id}:`, e);
                return { valid: false, error: `An error occurred while fetching guild information\n${e.message}` }
            }
        }

        await client.destroy();
        logger.tokenCheck(true, botInfo.username);
        return { valid: true, data: botInfo };
    } catch (error) {
        logger.error('Token check error', error);
        const isInvalidToken = error.message === 'An invalid token was provided.';
        logger.tokenCheck(false, null);
        return { 
            valid: false, 
            error: isInvalidToken 
                ? 'Error [TokenInvalid]: An invalid token was provided.' 
                : 'Error [TokenCheckFailed]: An error occurred while checking the token'
        };
    }
}

app.listen(config.port, () => {
    logger.success(`Server running at http://localhost:${config.port}`);
    logger.info(`Server accessible from any network interface`);
    logger.info(`Rate limiting: ${config.api.rateLimit.requestInterval} seconds between requests`);
    logger.info(`Ban duration: ${config.api.rateLimit.banDuration} minutes after ${config.api.rateLimit.maxViolations} violations`);
});