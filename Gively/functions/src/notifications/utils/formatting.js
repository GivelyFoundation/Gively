const { NOTIFICATION_TYPES } = require('../../config/constants');

function formatNotificationMessage(notificationData, groupData) {
    console.log('Formatting message for:', { notificationData, groupData });

    let title, body;

    // Default single-like notification if no specific group type
    if (!groupData.type || groupData.type === NOTIFICATION_TYPES.LIKE) {
        title = `${notificationData.actorName} liked your post`;
        body = notificationData.postPreview || 'your post';
    }
    // Multi-user, single post
    else if (groupData.type === NOTIFICATION_TYPES.LIKE_GROUP) {
        const actorCount = (groupData.actors || []).length;
        const firstActor = groupData.actors?.[0];
        
        if (!firstActor) {
            console.error('No actors found in group data');
            return null;
        }

        title = actorCount === 1 ? 
            `${firstActor.username} liked your post` :
            `${firstActor.username} and ${actorCount - 1} others liked your post`;
        
        body = groupData.postPreview || notificationData.postPreview || 'your post';
    }
    // Single user, multiple posts
    else if (groupData.type === NOTIFICATION_TYPES.LIKE_MULTIPLE) {
        if (!groupData.posts || groupData.posts.length === 0) {
            console.error('No posts found in group data');
            return null;
        }

        title = `${groupData.actorName} liked ${groupData.posts.length} of your posts`;
        body = `Most recent: ${groupData.posts[0].preview || 'your post'}`;
    }

    if (!title || !body) {
        console.error('Failed to generate title or body');
        return null;
    }

    return {
        title,
        body,
        data: {
            type: groupData.type,
            groupId: groupData.id,
            recipientId: groupData.recipientId,
            count: groupData.count,
            timestamp: Date.now().toString()
        },
        badge: 1,
        sound: 'default',
        priority: 'high',
        channelId: 'post_interactions',
        collapseId: groupData.type === NOTIFICATION_TYPES.LIKE_GROUP ? 
            `like_${groupData.postId}` : 
            `like_${groupData.actorId}`
    };
}

module.exports = {
    formatNotificationMessage
};