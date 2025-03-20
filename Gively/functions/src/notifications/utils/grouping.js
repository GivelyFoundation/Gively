const { db } = require('../../config/firebase');
const { TIME_WINDOWS, NOTIFICATION_TYPES } = require('../../config/constants');
const { FieldValue } = require('firebase-admin/firestore');
const timestamps = require('../../utils/timestamps');
const createLogger = require('../../utils/logger');

const logger = createLogger('grouping');

async function findExistingGroup(notificationData, timeWindow) {
    const cutoffTime = timestamps.subtract(timeWindow);
    
    // First try to find a group where this user has already liked multiple posts
    let userGroupQuery = db.collection('notifications')
        .where('type', '==', NOTIFICATION_TYPES.LIKE_MULTIPLE)
        .where('recipientId', '==', notificationData.recipientId)
        .where('actorId', '==', notificationData.actorId)
        .where('lastUpdated', '>=', cutoffTime)
        .orderBy('lastUpdated', 'desc')
        .limit(1);

    let userGroups = await userGroupQuery.get();
    if (!userGroups.empty) {
        logger.info('Found existing user-posts group', { 
            groupId: userGroups.docs[0].id 
        });
        return {
            doc: userGroups.docs[0],
            type: 'user'
        };
    }

    // Then try to find a group where multiple users liked the same post
    let postGroupQuery = db.collection('notifications')
        .where('type', '==', NOTIFICATION_TYPES.LIKE_GROUP)
        .where('recipientId', '==', notificationData.recipientId)
        .where('postId', '==', notificationData.postId)
        .where('lastUpdated', '>=', cutoffTime)
        .orderBy('lastUpdated', 'desc')
        .limit(1);

    let postGroups = await postGroupQuery.get();
    if (!postGroups.empty) {
        logger.info('Found existing post-users group', { 
            groupId: postGroups.docs[0].id 
        });
        return {
            doc: postGroups.docs[0],
            type: 'post'
        };
    }

    return null;
}

async function updateGroup(groupResult, notificationData) {
    const { doc: groupDoc, type } = groupResult;
    const groupData = groupDoc.data();
    const updates = {};

    if (type === 'post') {
        // Add new user to existing post group
        const newActor = {
            userId: notificationData.actorId,
            username: notificationData.actorName,
            timestamp: timestamps.now()
        };

        if (!(groupData.actors || []).some(actor => actor.userId === notificationData.actorId)) {
            updates.actors = FieldValue.arrayUnion(newActor);
            updates.count = FieldValue.increment(1);
        }
    } else {
        // Add new post to existing user group
        const newPost = {
            postId: notificationData.postId,
            preview: notificationData.postPreview,
            timestamp: timestamps.now()
        };

        if (!(groupData.posts || []).some(post => post.postId === notificationData.postId)) {
            updates.posts = FieldValue.arrayUnion(newPost);
            updates.count = FieldValue.increment(1);
        }
    }

    if (Object.keys(updates).length > 0) {
        updates.lastUpdated = timestamps.server();
        updates.needsDelivery = true;
        
        logger.info('Updating group', { 
            groupId: groupDoc.id, 
            updates 
        });
        
        await groupDoc.ref.update(updates);
    }

    return {
        groupId: groupDoc.id,
        isNewGroup: false,
        shouldSendNotification: Object.keys(updates).length > 0
    };
}

async function createNewGroup(notificationData) {
    // Decide group type based on recent activity
    const timeWindow = TIME_WINDOWS.NOTIFICATION_GROUP.LIKE;
    const cutoffTime = timestamps.subtract(timeWindow);

    // Check for recent likes by this user
    const recentLikesQuery = await db.collection('posts')
        .where('likers', 'array-contains', notificationData.actorId)
        .where('uid', '==', notificationData.recipientId)
        .where('lastLikedAt', '>=', cutoffTime)
        .get();

    // If user has liked multiple posts recently, create a user-posts group
    const shouldCreateUserGroup = recentLikesQuery.size > 1;
    const groupRef = db.collection('notifications').doc();

    const groupData = shouldCreateUserGroup ? {
        type: NOTIFICATION_TYPES.LIKE_MULTIPLE,
        recipientId: notificationData.recipientId,
        actorId: notificationData.actorId,
        actorName: notificationData.actorName,
        posts: [{
            postId: notificationData.postId,
            preview: notificationData.postPreview,
            timestamp: timestamps.now()
        }],
        count: 1
    } : {
        type: NOTIFICATION_TYPES.LIKE_GROUP,
        recipientId: notificationData.recipientId,
        postId: notificationData.postId,
        postPreview: notificationData.postPreview,
        actors: [{
            userId: notificationData.actorId,
            username: notificationData.actorName,
            timestamp: timestamps.now()
        }],
        count: 1
    };

    groupData.timestamp = timestamps.server();
    groupData.lastUpdated = timestamps.server();
    groupData.needsDelivery = true;

    logger.info('Creating new group', { 
        groupId: groupRef.id, 
        type: groupData.type 
    });
    
    await groupRef.set(groupData);

    return {
        groupId: groupRef.id,
        isNewGroup: true,
        shouldSendNotification: true
    };
}

async function addToNotificationGroup(notificationData) {
    const existingGroup = await findExistingGroup(
        notificationData,
        TIME_WINDOWS.NOTIFICATION_GROUP.LIKE
    );

    const result = existingGroup ? 
        await updateGroup(existingGroup, notificationData) :
        await createNewGroup(notificationData);

    logger.info('Group operation result', result);
    return result;
}

module.exports = {
    addToNotificationGroup
};