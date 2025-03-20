const { db } = require('../config/firebase');
const createLogger = require('../utils/logger');
const timestamps = require('../utils/timestamps');
const { METRIC_TYPES } = require('../config/constants');

const logger = createLogger('notificationMetrics');

/**
 * Base metric recording function
 */
async function recordMetric(collection, type, data) {
    try {
        const metricData = {
            type,
            timestamp: timestamps.now(),
            platform: 'expo',
            ...data
        };

        // Add to metrics collection
        await db.collection(collection).add(metricData);

        // Get date for aggregation
        const date = new Date().toISOString().split('T')[0];
        
        // Update aggregates
        await db.runTransaction(async (transaction) => {
            const aggregateRef = db.doc(
                `metric_aggregates/${collection}/${date}/${type}`
            );
            const doc = await transaction.get(aggregateRef);
            
            const updates = getAggregateUpdates(
                collection, 
                doc.exists ? doc.data() : null, 
                data
            );

            if (doc.exists) {
                transaction.update(aggregateRef, updates);
            } else {
                transaction.set(aggregateRef, updates);
            }
        });

        logger.debug(`Recorded ${collection} metric`, { 
            type,
            success: data.success
        });
    } catch (error) {
        logger.error(`Error recording ${collection} metric`, error, {
            type,
            data
        });
        
        // Don't throw error to prevent cascade
        return false;
    }
}

/**
 * Get aggregate updates based on metric type
 */
function getAggregateUpdates(collection, currentData = null, newData) {
    const base = {
        lastUpdated: timestamps.now()
    };

    switch (collection) {
    case 'notification_metrics':
        return {
            ...base,
            total: (currentData?.total || 0) + 1,
            success: (currentData?.success || 0) + (newData.success ? 1 : 0),
            failure: (currentData?.failure || 0) + (!newData.success ? 1 : 0),
            debounced: (currentData?.debounced || 0) + 
                (!newData.notificationSent ? 1 : 0),
            newGroups: (currentData?.newGroups || 0) + 
                (newData.isNewGroup ? 1 : 0),
            groupUpdates: (currentData?.groupUpdates || 0) + 
                (!newData.isNewGroup ? 1 : 0),
            actualTotalCount: (currentData?.actualTotalCount || 0) + 
                (newData.actualLikeCount || 0)
        };

    case 'token_metrics':
        return {
            ...base,
            total: (currentData?.total || 0) + 1,
            success: (currentData?.success || 0) + (newData.success ? 1 : 0),
            failure: (currentData?.failure || 0) + (!newData.success ? 1 : 0),
            validated: (currentData?.validated || 0) + 
                (newData.validated ? 1 : 0),
            invalid: (currentData?.invalid || 0) + 
                (newData.invalid ? 1 : 0)
        };

    case 'performance_metrics':
        return {
            ...base,
            count: (currentData?.count || 0) + 1,
            totalDuration: (currentData?.totalDuration || 0) + 
                (newData.duration || 0),
            maxDuration: Math.max(
                currentData?.maxDuration || 0, 
                newData.duration || 0
            ),
            minDuration: Math.min(
                currentData?.minDuration || Number.MAX_SAFE_INTEGER, 
                newData.duration || Number.MAX_SAFE_INTEGER
            ),
            debouncedCount: (currentData?.debouncedCount || 0) + 
                (newData.debounced ? 1 : 0)
        };

    default:
        return base;
    }
}

/**
 * Record notification event metric
 */
async function recordNotificationMetric(type, data) {
    return recordMetric('notification_metrics', type, {
        // Group-related metrics
        groupId: data.groupId,
        isNewGroup: data.isNewGroup,
        actualCount: data.actualLikeCount,
        groupCount: data.groupCount || data.actualLikeCount || 1,
        // Delivery metrics
        notificationSent: data.notificationSent,
        debounced: !data.notificationSent,
        // Actor info
        actorId: data.actorId,
        recipientId: data.recipientId,
        // Status
        success: data.success,
        delivered: data.delivered,
        error: data.error,
        // Additional context
        ...data.metadata
    });
}

/**
 * Record token-related metric
 */
async function recordTokenMetric(action, data) {
    return recordMetric('token_metrics', action, {
        // Token info
        tokenType: 'expo',
        tokenPrefix: data.tokenPrefix,
        // Status
        success: data.success,
        invalid: data.invalid,
        validated: data.validated,
        // Error handling
        error: data.error,
        validationFailed: data.validationFailed,
        formatError: data.formatError,
        deliveryFailed: data.deliveryFailed
    });
}

/**
 * Record performance metric
 */
async function recordPerformanceMetric(operation, duration, data = {}) {
    return recordMetric('performance_metrics', operation, {
        // Performance data
        duration,
        // Group metrics
        groupId: data.groupId,
        groupSize: data.groupSize,
        // Performance context
        debounced: data.debounced,
        batchSize: data.batchSize,
        success: data.success,
        error: data.error,
        // Additional context
        ...data.metadata
    });
}


module.exports = {
    recordNotificationMetric,
    recordTokenMetric,
    recordPerformanceMetric,
};