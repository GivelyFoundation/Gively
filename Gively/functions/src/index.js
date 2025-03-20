const { setGlobalOptions } = require('firebase-functions/v2');
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { FUNCTION_CONFIG } = require('./config/constants');
const { handlePostLike } = require('./notifications/handlers/postHandlers');
const createLogger = require('./utils/logger');

const logger = createLogger('index');

setGlobalOptions(FUNCTION_CONFIG.DEFAULT);

exports.onPostLike = onDocumentUpdated('posts/{postId}', async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    
    const beforeLikers = beforeData?.likers || [];
    const afterLikers = afterData?.likers || [];
    
    // Only proceed if someone new liked the post
    const newLikers = afterLikers.filter(liker => !beforeLikers.includes(liker));
    
    if (newLikers.length === 0) {
        logger.info('No new likers found, skipping notification');
        return null;
    }
    
    logger.info('Processing new likes', { 
        postId: event.params.postId, 
        newLikers: newLikers.length 
    });
    
    // Process each new liker once
    for (const newLiker of newLikers) {
        await handlePostLike(event, newLiker);
    }
    
    return null;
});