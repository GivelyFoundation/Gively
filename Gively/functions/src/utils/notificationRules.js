const { db } = require('../config/firebase');
const { TIME_WINDOWS } = require('../config/constants');
const createLogger = require('./logger');
const timestamps = require('./timestamps');
const { validatePushToken } = require('./validation');

const logger = createLogger('notificationRules');

/**
 * Get and validate user data
 */
async function getUserData(recipientId) {
    const userDoc = await db.doc(`users/${recipientId}`).get();
    if (!userDoc.exists) {
        logger.warn('Recipient not found', { recipientId });
        return null;
    }
    return userDoc.data();
}

/**
 * Validate user notification preferences
 */
function validateUserPreferences(userData, type) {
    const preferences = userData.notificationPreferences || {};
    if (preferences[type] === false) {
        logger.info('Notifications disabled for type', { 
            userId: userData.id, 
            type 
        });
        return false;
    }
    return true;
}

/**
 * Validate user's push token
 */
function validateUserToken(userData) {
    if (!userData.expoPushToken) {
        logger.info('No push token found', { userId: userData.id });
        return false;
    }

    if (!validatePushToken(userData.expoPushToken)) {
        logger.warn('Invalid push token format', { 
            userId: userData.id,
            tokenPrefix: userData.expoPushToken.substring(0, 20)
        });
        return false;
    }

    if (userData.tokenStatus === 'invalid') {
        logger.info('Token marked as invalid', { userId: userData.id });
        return false;
    }

    return true;
}

/**
 * Check if recipient can receive notifications
 */
async function checkRecipientEligibility(recipientId, type) {
    try {
        const userData = await getUserData(recipientId);
        if (!userData) return false;

        return (
            validateUserPreferences(userData, type) &&
            validateUserToken(userData) &&
            !userData.notificationsDisabled
        );
    } catch (error) {
        logger.error('Error checking recipient eligibility', error, { recipientId });
        return false;
    }
}

/**
 * Check if this is the first notification for a post
 */
async function isFirstNotification(recipientId, type, postId) {
    try {
        if (!postId) return false;

        const query = db.collection('notifications')
            .where('recipientId', '==', recipientId)
            .where('type', '==', type)
            .where('postId', '==', postId)
            .limit(1);

        const snapshot = await query.count().get();
        return snapshot.data().count === 0;
    } catch (error) {
        logger.error('Error checking first notification', error, {
            recipientId,
            type,
            postId
        });
        return false;
    }
}

/**
 * Check if we're within the debounce window
 */
async function checkDebounceWindow(recipientId, type, postId) {
    try {
        const debounceWindow = TIME_WINDOWS.NOTIFICATION_DEBOUNCE[type] || 
                             TIME_WINDOWS.NOTIFICATION_DEBOUNCE.DEFAULT;
        const cutoffTime = timestamps.subtract(debounceWindow);

        let query = db.collection('notifications')
            .where('recipientId', '==', recipientId)
            .where('type', '==', type)
            .where('lastNotificationSentAt', '>=', cutoffTime);

        if (postId) {
            query = query.where('postId', '==', postId);
        }

        const snapshot = await query.count().get();
        const recentCount = snapshot.data().count;

        if (recentCount > 0) {
            logger.debug('Within debounce window', {
                recipientId,
                type,
                postId,
                recentCount
            });
            return false;
        }

        return true;
    } catch (error) {
        logger.error('Error checking debounce window', error, {
            recipientId,
            type,
            postId
        });
        return false;
    }
}

/**
 * Main function to determine if a notification should be sent
 */
async function shouldSendNotification(recipientId, type, postId = null) {
    try {
        // First check if recipient can receive notifications
        const isEligible = await checkRecipientEligibility(recipientId, type);
        if (!isEligible) {
            return false;
        }

        // Always allow first notification for a post
        if (postId && await isFirstNotification(recipientId, type, postId)) {
            logger.debug('First notification for post', {
                recipientId,
                type,
                postId
            });
            return true;
        }

        // Check debounce window for subsequent notifications
        return await checkDebounceWindow(recipientId, type, postId);

    } catch (error) {
        logger.error('Error in shouldSendNotification', error, {
            recipientId,
            type,
            postId
        });
        return false; // Fail safe: don't send on error
    }
}

/**
 * Check notification delivery rules
 */
async function checkDeliveryRules(groupData, type) {
    try {
        // New groups always deliver
        if (!groupData.lastNotificationSentAt) {
            return true;
        }

        // Check debounce window
        const timeSinceLastNotification = 
            Date.now() - groupData.lastNotificationSentAt.toMillis();
        const debounceWindow = TIME_WINDOWS.NOTIFICATION_DEBOUNCE[type] || 
                             TIME_WINDOWS.NOTIFICATION_DEBOUNCE.DEFAULT;

        const shouldDeliver = timeSinceLastNotification >= debounceWindow;

        logger.debug('Checked delivery rules', {
            groupId: groupData.id,
            type,
            timeSinceLastNotification,
            debounceWindow,
            shouldDeliver
        });

        return shouldDeliver;
    } catch (error) {
        logger.error('Error checking delivery rules', error, {
            groupId: groupData?.id,
            type
        });
        return false;
    }
}

module.exports = {
    shouldSendNotification,
    checkDeliveryRules,
    checkRecipientEligibility,
    isFirstNotification
};