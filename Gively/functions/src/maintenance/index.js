const { db } = require('../config/firebase');
const { 
    TIME_WINDOWS, 
    LIMITS,
    NOTIFICATION_STATES 
} = require('../config/constants');
const createLogger = require('../utils/logger');
const messagingService = require('../notifications/services/messagingService');
const { validatePushToken } = require('../utils/validation');
const { FieldValue } = require('firebase-admin/firestore');
const timestamps = require('../utils/timestamps');

const logger = createLogger('maintenance');

/**
 * Process documents in batches with proper error handling
 */
async function processBatch(query, processFn, batchSize = LIMITS.MAX_BATCH_SIZE) {
    let lastDoc = null;
    let processedCount = 0;
    let hasMore = true;

    while (hasMore) {
        try {
            let currentQuery = query.limit(batchSize);
            if (lastDoc) {
                currentQuery = currentQuery.startAfter(lastDoc);
            }

            const snapshot = await currentQuery.get();
            if (snapshot.empty) {
                hasMore = false;
                break;
            }

            await processFn(snapshot.docs);
            processedCount += snapshot.docs.length;
            lastDoc = snapshot.docs[snapshot.docs.length - 1];

            logger.info('Processed batch', {
                processedCount,
                batchSize: snapshot.docs.length
            });
        } catch (error) {
            logger.error('Error processing batch', {
                error,
                lastProcessedCount: processedCount
            });
            throw error;
        }
    }

    return processedCount;
}

/**
 * Clean up old notifications
 */
async function cleanupOldNotifications(context) {
    try {
        const cutoffTime = timestamps.subtract(TIME_WINDOWS.CLEANUP.OLD_NOTIFICATIONS);
        
        logger.info('Starting notification cleanup', { 
            cutoffTime: cutoffTime.toDate() 
        });

        const query = db.collection('notifications')
            .where('timestamp', '<=', cutoffTime);

        const cleanupBatch = async (docs) => {
            const batch = db.batch();
            const recipientUpdates = new Map();

            for (const doc of docs) {
                const data = doc.data();
                
                // Update unread counts if needed
                if (!data.read && data.recipientId) {
                    const current = recipientUpdates.get(data.recipientId) || 0;
                    recipientUpdates.set(data.recipientId, current - 1);
                }

                batch.delete(doc.ref);
            }

            // Update recipient unread counts
            for (const [recipientId, countDelta] of recipientUpdates) {
                const recipientRef = db.doc(`users/${recipientId}`);
                batch.update(recipientRef, {
                    unreadNotifications: FieldValue.increment(countDelta)
                });
            }

            await batch.commit();
        };

        const deletedCount = await processBatch(query, cleanupBatch);

        // Log maintenance operation
        await db.collection('maintenance_logs').add({
            type: 'notification_cleanup',
            deletedCount,
            cutoffTime,
            timestamp: timestamps.server()
        });

        return { deletedCount };
    } catch (error) {
        logger.error('Error cleaning up notifications', error);
        throw error;
    }
}

/**
 * Clean up stale notification groups
 */
async function cleanupStaleGroups(context) {
    try {
        const cutoffTime = timestamps.subtract(TIME_WINDOWS.CLEANUP.STALE_GROUPS);
        
        logger.info('Starting stale group cleanup');

        const query = db.collection('notifications')
            .where('lastUpdated', '<=', cutoffTime)
            .where('needsDelivery', '==', true);

        let processedCount = 0;
        let deletedCount = 0;

        const processStaleBatch = async (docs) => {
            const batch = db.batch();

            for (const doc of docs) {
                const data = doc.data();
                processedCount++;

                if (data.postId) {
                    // Verify post still exists and has likes
                    const postDoc = await db.doc(`posts/${data.postId}`).get();
                    if (!postDoc.exists || (postDoc.data().likers || []).length === 0) {
                        batch.delete(doc.ref);
                        deletedCount++;
                        continue;
                    }

                    // Update notification status
                    batch.update(doc.ref, {
                        needsDelivery: false,
                        deliveryStatus: NOTIFICATION_STATES.GROUPED,
                        lastUpdated: timestamps.server()
                    });
                } else {
                    // Delete orphaned notifications
                    batch.delete(doc.ref);
                    deletedCount++;
                }
            }

            await batch.commit();
        };

        await processBatch(query, processStaleBatch);

        // Log maintenance operation
        await db.collection('maintenance_logs').add({
            type: 'stale_group_cleanup',
            processedCount,
            deletedCount,
            timestamp: timestamps.server()
        });

        return { processedCount, deletedCount };
    } catch (error) {
        logger.error('Error cleaning up stale groups', error);
        throw error;
    }
}

/**
 * Remove invalid tokens and their notifications
 */
async function removeInvalidTokens(context) {
    try {
        logger.info('Starting token validation');

        const query = db.collection('users')
            .where('expoPushToken', '!=', null);

        let validatedCount = 0;
        let invalidCount = 0;
        let updatedCount = 0;

        const validateBatch = async (docs) => {
            const batch = db.batch();

            for (const doc of docs) {
                const userData = doc.data();
                const token = userData.expoPushToken;

                if (!token) continue;

                validatedCount++;
                try {
                    if (!validatePushToken(token) || 
                        !(await messagingService.validateToken(token))) {
                        
                        batch.update(doc.ref, {
                            expoPushToken: null,
                            tokenStatus: 'invalid',
                            tokenInvalidatedAt: timestamps.server()
                        });
                        invalidCount++;
                    }
                } catch (error) {
                    logger.warn('Error validating token', {
                        userId: doc.id,
                        error: error.message
                    });
                }
            }

            if (batch._ops.length > 0) {
                await batch.commit();
                updatedCount += batch._ops.length;
            }
        };

        await processBatch(query, validateBatch);

        // Log maintenance operation
        await db.collection('maintenance_logs').add({
            type: 'token_cleanup',
            validatedCount,
            invalidCount,
            updatedCount,
            timestamp: timestamps.server()
        });

        return { validatedCount, invalidCount, updatedCount };
    } catch (error) {
        logger.error('Error removing invalid tokens', error);
        throw error;
    }
}

/**
 * Update user's push token
 */
async function updateUserToken(userId, token) {
    try {
        if (!validatePushToken(token)) {
            logger.warn('Invalid push token format', {
                userId,
                tokenPrefix: token?.substring(0, 20)
            });
            return false;
        }

        const userRef = db.doc(`users/${userId}`);
        const user = await userRef.get();

        if (!user.exists) {
            logger.warn('User not found for token update', { userId });
            return false;
        }

        const userData = user.data();
        const oldToken = userData.expoPushToken;

        // Only update if token has changed
        if (token !== oldToken) {
            await userRef.update({
                expoPushToken: token,
                tokenType: 'expo',
                tokenStatus: 'valid',
                tokenUpdatedAt: timestamps.server(),
                lastActiveAt: timestamps.server()
            });

            logger.info('Updated push token', {
                userId,
                tokenPrefix: token.substring(0, 20)
            });
        }

        return true;
    } catch (error) {
        logger.error('Error updating push token', error, { userId });
        return false;
    }
}

module.exports = {
    cleanupOldNotifications,
    cleanupStaleGroups,
    removeInvalidTokens,
    updateUserToken
};