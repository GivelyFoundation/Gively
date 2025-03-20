const createLogger = require('./logger');
const { recordErrorMetric } = require('../metrics/errorMetrics');
const timestamps = require('./timestamps');

const logger = createLogger('errorUtils');

/**
 * Base notification error class
 * @extends Error
 */
class NotificationError extends Error {
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'NotificationError';
        this.code = code;
        this.context = context;
    }
}

/**
 * Timestamp error
 * @extends NotificationError
 */
class TimestampError extends NotificationError {
    constructor(message, context = {}) {
        super(message, 'timestamp_error', context);
        this.name = 'TimestampError';
    }
}

/**
 * Validation error for notification data
 * @extends NotificationError
 */
class ValidationError extends NotificationError {
    constructor(message, context = {}) {
        super(message, 'validation_error', context);
        this.name = 'ValidationError';
    }
}

/**
 * Token-related error class
 * @extends NotificationError
 */
class TokenError extends NotificationError {
    constructor(message, context = {}) {
        super(message, 'token_error', context);
        this.name = 'TokenError';
    }
}

/**
 * Database operation error class
 * @extends NotificationError
 */
class DatabaseError extends NotificationError {
    constructor(message, context = {}) {
        super(message, 'database_error', context);
        this.name = 'DatabaseError';
    }
}

/**
 * Rate limiting error class
 * @extends NotificationError
 */
class RateLimitError extends NotificationError {
    constructor(message, context = {}) {
        super(message, 'rate_limit_error', context);
        this.name = 'RateLimitError';
    }
}

/**
 * Error handler wrapper for async functions
 * @param {Function} fn - Function to wrap
 * @param {Object} options - Handler options
 * @return {Function} Wrapped function
 */
const asyncErrorHandler = (fn, options = {}) => {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            const context = {
                functionName: fn.name,
                args: options.logArgs ? args : undefined,
                ...options.context,
            };

            handleError(error, context);

            if (options.rethrow !== false) {
                throw error;
            }

            return options.fallback;
        }
    };
};

/**
 * Centralized error handler
 * @param {Error} error - The error to handle
 * @param {Object} context - Error context
 */
const handleError = async (error, context = {}) => {
    try {
        const severity = getSeverity(error);
        
        // Add timestamp to error context
        const errorContext = {
            ...context,
            timestamp: timestamps.now(),
            errorId: generateErrorId() // Add this helper
        };

        logger[severity]('Error occurred', {
            error: {
                name: error.name,
                message: error.message,
                code: error.code || 'unknown',
                stack: error.stack,
            },
            context: JSON.parse(JSON.stringify(errorContext))
        });

        if (!context.source?.includes('notificationMetrics')) {
            await recordErrorMetric(error, {
                ...context,
                severity,
                platform: 'expo'
            }).catch(metricError => {
                logger.warn('Failed to record error metric', {
                    originalError: error.message,
                    metricError: metricError.message
                });
            });
        }
        if (error instanceof TokenError) {
            await handleTokenError(error);
        } else if (error instanceof RateLimitError) {
            await handleRateLimitError(error);
        } else if (error instanceof CredentialError || error.code === 'credential_error') {
            logger.error('Push notification credential error', {
                message: error.message,
                context: error.context
            });
        }
    } catch (metricError) {
        logger.error('Error in error handler', {
            originalError: error.message,
            metricError: metricError.message,
            timestamp: Date.now()
        });
    }
};

/**
 * Determines error severity
 * @param {Error} error - The error to evaluate
 * @return {string} Severity level
 */
const getSeverity = (error) => {
    if (error instanceof ValidationError) {
        return 'warn';
    }

    if (error instanceof TimestampError) {
        return 'warn';
    }

    if (error instanceof TokenError) {
        return error.context.invalidToken ? 'warn' : 'error';
    }

    if (error instanceof RateLimitError) {
        return 'warn';
    }

    if (error instanceof DatabaseError) {
        return 'error';
    }

    if (error instanceof CredentialError || error.code === 'credential_error') {
        return 'error';
    }

    return 'error';
};

/**
 * Handles token-specific errors
 * @param {TokenError} error - Token error
 */
const handleTokenError = async (error) => {
    const { userId, token } = error.context;

    if (userId && token) {
        try {
            const { db } = require('../config/firebase');
            await db.doc(`users/${userId}`).update({
                expoPushToken: null,        // Updated from fcmToken
                tokenType: 'expo',          // Added token type
                tokenStatus: 'invalid',
                tokenInvalidatedAt: new Date(),
            });

            logger.info('Invalidated Expo Push token for user', { 
                userId,
                tokenPrefix: token.substring(0, 20) 
            });
        } catch (dbError) {
            logger.error('Error invalidating Expo token', {
                userId,
                error: dbError.message,
            });
        }
    }
};

/**
 * Handles rate limit errors
 * @param {RateLimitError} error - Rate limit error
 */
const handleRateLimitError = async (error) => {
    const { userId, type } = error.context;

    try {
        const { db } = require('../config/firebase');
        await db.collection('rate_limit_logs').add({
            userId,
            type,
            timestamp: new Date(),
            message: error.message,
            platform: 'expo' // Added platform identifier
        });
    } catch (dbError) {
        logger.error('Error logging rate limit', {
            userId,
            error: dbError.message,
        });
    }
};

/**
 * Creates a user-friendly error message
 * @param {Error} error - The error
 * @return {string} User-friendly message
 */
const getUserFriendlyMessage = (error) => {
    switch (error.code) {
    case 'validation_error':
        return 'The notification data was invalid. Please try again.';
    case 'token_error':
        return 'There was an issue with your notification settings. Please re-enable notifications.';
    case 'rate_limit_error':
        return 'Too many notifications sent. Please try again later.';
    case 'database_error':
        return 'There was an issue accessing the database. Please try again.';
    case 'PUSH_TOK_INVALID':         // Added Expo-specific error
        return 'Your notification token is invalid. Please restart the app.';
    case 'PUSH_TOO_MANY_REQUESTS':   // Added Expo-specific error
        return 'Too many notifications. Please try again later.';
    default:
        return 'An unexpected error occurred. Please try again later.';
    }
};

/**
 * Utility to safely execute batch operations
 * @param {Function} batchOperation - Batch operation function
 * @param {Object} options - Operation options
 */
const executeBatchSafely = async (batchOperation, options = {}) => {
    const maxRetries = options.maxRetries || 3;
    const batchSize = options.batchSize || 100; // Updated for Expo's batch size limit
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            return await batchOperation(batchSize);
        } catch (error) {
            attempt++;

            logger.warn('Batch operation failed', {
                attempt,
                error: error.message,
            });

            if (attempt === maxRetries) {
                throw new DatabaseError('Batch operation failed after retries', {
                    attempts: attempt,
                    originalError: error.message,
                });
            }

            // Exponential backoff
            await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, attempt) * 1000),
            );
        }
    }
};

class CredentialError extends NotificationError {
    constructor(message, context = {}) {
        super(message, 'credential_error', context);
        this.name = 'CredentialError';
    }
}

function generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
    NotificationError,
    ValidationError,
    TokenError,
    DatabaseError,
    RateLimitError,
    CredentialError,
    TimestampError,
    asyncErrorHandler,
    handleError,
    getUserFriendlyMessage,
    executeBatchSafely,
    generateErrorId
};