const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { PUSH_CONFIGS } = require('../../config/constants');

async function sendMessage(message) {
    if (!message.to || !message.title || !message.body) {
        throw new Error('Invalid message format');
    }

    const payload = {
        to: message.to,
        title: message.title,
        body: message.body,
        data: message.data || {},
        sound: message.sound || 'default',
        badge: message.badge || 1,
        channelId: message.channelId,
        priority: 'high',
        collapseId: message.collapseId,
        _displayInForeground: true
    };

    let attempt = 0;
    while (attempt < PUSH_CONFIGS.RETRY_COUNT) {
        try {
            const response = await fetch(PUSH_CONFIGS.API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (result.data?.[0]?.status === 'ok') {
                return result.data[0].id;
            }

            // Handle Expo-specific errors
            const error = result.data?.[0]?.message || result.errors?.[0]?.message;
            if (PUSH_CONFIGS.ERROR_CODES.INVALID_TOKEN.includes(error)) {
                throw new Error('Invalid token');
            }
            if (PUSH_CONFIGS.ERROR_CODES.RATE_LIMIT.includes(error)) {
                attempt++;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                continue;
            }
            throw new Error(error || 'Push notification failed');
        
        } catch (error) {
            if (attempt === PUSH_CONFIGS.RETRY_COUNT - 1) throw error;
            attempt++;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
    }
}

module.exports = { sendMessage };