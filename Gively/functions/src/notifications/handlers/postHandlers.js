const { db } = require('../../config/firebase');
const { NOTIFICATION_TYPES } = require('../../config/constants');
const { addToNotificationGroup } = require('../utils/grouping');
const notificationService = require('../services/notificationService');
const timestamps = require('../../utils/timestamps');
const createLogger = require('../../utils/logger');

const logger = createLogger('postHandlers');

async function extractLikeData(event, likerId) {
    const postDoc = await db.doc(`posts/${event.params.postId}`).get();
    if (!postDoc.exists) {
        logger.warn('Post not found', { postId: event.params.postId });
        return null;
    }
    
    const postData = postDoc.data();
    
    // Verify the like is still present (in case of rapid unlike)
    if (!postData.likers?.includes(likerId)) {
        logger.info('Like no longer present', { 
            postId: event.params.postId,
            likerId 
        });
        return null;
    }

    const likerDoc = await db.doc(`users/${likerId}`).get();
    if (!likerDoc.exists) {
        logger.warn('Liker not found', { likerId });
        return null;
    }

    return {
        actorId: likerId,
        actorName: likerDoc.data()?.username,
        postId: event.params.postId,
        postPreview: postData.postText?.slice(0, 50),
        recipientId: postData.uid
    };
}

async function handlePostLike(event, likerId) {
    logger.info('Processing like event', { 
        postId: event.params.postId,
        likerId 
    });
    
    const likeData = await extractLikeData(event, likerId);
    if (!likeData) {
        logger.info('No like data found', { postId: event.params.postId });
        return null;
    }
    
    // Skip self-likes
    if (likeData.recipientId === likeData.actorId) {
        logger.info('Skipping self-like', { userId: likerId });
        return null;
    }

    // Check for recent notification to prevent duplicates
    const recentQuery = await db.collection('notifications')
        .where('recipientId', '==', likeData.recipientId)
        .where('actorId', '==', likerId)
        .where('postId', '==', event.params.postId)
        .where('timestamp', '>=', timestamps.subtract(60000)) // Last minute
        .limit(1)
        .get();

    if (!recentQuery.empty) {
        logger.info('Recent notification exists, skipping', {
            postId: event.params.postId,
            likerId
        });
        return null;
    }

    const notificationData = {
        ...likeData,
        timestamp: timestamps.server()
    };

    const { groupId, shouldSendNotification } = 
        await addToNotificationGroup(notificationData);
    
    logger.info('Group operation completed', { 
        groupId, 
        shouldSendNotification 
    });

    if (shouldSendNotification) {
        await notificationService.sendNotification(notificationData, groupId);
    }

    return null;
}

module.exports = {
    handlePostLike
};