const { db } = require('../../config/firebase');
const { TIME_WINDOWS, NOTIFICATION_TYPES } = require('../../config/constants');
const messagingService = require('./messagingService');
const { formatNotificationMessage } = require('../utils/formatting');
const timestamps = require('../../utils/timestamps');
const createLogger = require('../../utils/logger');

const logger = createLogger('notificationService');

// Track pending notifications
const pendingNotifications = new Map();

async function getRecipientToken(recipientId) {
    const userDoc = await db.doc(`users/${recipientId}`).get();
    if (!userDoc.exists) return null;
    return userDoc.data().expoPushToken;
}

async function updateGroupDeliveryStatus(groupId, success = true) {
    await db.doc(`notifications/${groupId}`).update({
        needsDelivery: false,
        lastDeliveryAttempt: timestamps.server(),
        deliverySuccess: success,
        lastNotificationSentAt: success ? timestamps.server() : null
    });
}

async function sendNotificationImmediate(token, message, groupId) {
    try {
        await messagingService.sendMessage({
            to: token,
            ...message
        });
        await updateGroupDeliveryStatus(groupId, true);
    } catch (error) {
        logger.error('Error sending notification', { error, groupId });
        await updateGroupDeliveryStatus(groupId, false);
        throw error;
    }
}

async function processPendingNotification(groupId) {
    const pendingInfo = pendingNotifications.get(groupId);
    if (!pendingInfo) return;

    pendingNotifications.delete(groupId);

    const { notificationData, timeout } = pendingInfo;
    clearTimeout(timeout);

    const groupDoc = await db.doc(`notifications/${groupId}`).get();
    if (!groupDoc.exists || !groupDoc.data().needsDelivery) return;

    const token = await getRecipientToken(notificationData.recipientId);
    if (!token) return;

    const message = formatNotificationMessage(notificationData, {
        id: groupId,
        ...groupDoc.data()
    });

    await sendNotificationImmediate(token, message, groupId);
}

async function sendNotification(notificationData, groupId) {
    logger.info('Scheduling notification', { groupId });

    // Clear any existing pending notification for this group
    if (pendingNotifications.has(groupId)) {
        const { timeout } = pendingNotifications.get(groupId);
        clearTimeout(timeout);
    }

    // Schedule new notification
    const timeout = setTimeout(
        () => processPendingNotification(groupId),
        5000 // 5 second delay to allow for grouping
    );

    pendingNotifications.set(groupId, {
        notificationData,
        timeout
    });
}

// Cleanup function for tests or server shutdown
function clearPendingNotifications() {
    for (const { timeout } of pendingNotifications.values()) {
        clearTimeout(timeout);
    }
    pendingNotifications.clear();
}

module.exports = {
    sendNotification,
    clearPendingNotifications, // Export for testing
    // Internal functions exported for testing
    _processPendingNotification: processPendingNotification,
    _pendingNotifications: pendingNotifications
};