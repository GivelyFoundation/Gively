const { logger } = require('firebase-functions/v2');

const createLogger = (module) => {
    const addContext = (data = {}) => ({
        ...data,
        module,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });

    return {
        info: (message, data = {}) => {
            logger.info(`[${module}] ${message}`, addContext(data));
        },
        error: (message, error = {}, data = {}) => {
            const errorData = error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                code: error.code,
                name: error.name
            } : error;

            logger.error(`[${module}] ${message}`, addContext({
                ...data,
                error: errorData
            }));
        },
        warn: (message, data = {}) => {
            logger.warn(`[${module}] ${message}`, addContext(data));
        },
        debug: (message, data = {}) => {
            logger.debug(`[${module}] ${message}`, addContext(data));
        },
        // Add new method for critical errors
        critical: (message, error = {}, data = {}) => {
            const errorData = error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                code: error.code,
                name: error.name
            } : error;

            logger.error(`[${module}][CRITICAL] ${message}`, addContext({
                ...data,
                error: errorData,
                priority: 'critical'
            }));
        }
    };
};

module.exports = createLogger;