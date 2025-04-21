// Created by NAT2K15 Development || https://store.nat2k15.xyz

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const cors = require('cors');
const config = require('./config');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/check_token', async (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.json({ valid: false, error: 'No token provided' });
    }

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
            }
        }

        await client.destroy();
        res.json({ valid: true, data: botInfo });

    } catch (error) {
        console.error('Token check error:', error);
        res.json({ 
            valid: false, 
            error: error.message === 'An invalid token was provided.' 
                ? 'Invalid token' 
                : 'An error occurred while checking the token'
        });
    }
});

app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
}); 