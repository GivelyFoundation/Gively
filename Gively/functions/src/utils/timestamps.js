const { FieldValue, Timestamp } = require('firebase-admin/firestore');
const createLogger = require('./logger');
const { ValidationError } = require('./errorUtils'); 

const logger = createLogger('timestamps');

/**
 * Utility functions for handling timestamps consistently across the application
 */
const timestamps = {
    /**
     * Get current time as Firestore Timestamp
     * @return {Timestamp}
     */
    now: () => Timestamp.now(),
    
    /**
     * Get server timestamp for Firestore writes
     * @return {FieldValue}
     */
    server: () => FieldValue.serverTimestamp(),
    
    /**
     * Convert milliseconds to Firestore Timestamp
     * @param {number} milliseconds
     * @return {Timestamp}
     */
    fromMillis: (milliseconds) => {
        if (typeof milliseconds !== 'number') {
            throw new ValidationError('Invalid milliseconds value', {
                value: milliseconds,
                expectedType: 'number'
            });
        }
        return Timestamp.fromMillis(milliseconds);
    },
    
    /**
     * Convert any supported timestamp format to Firestore Timestamp
     * @param {Date|Timestamp|FieldValue|number} timestamp
     * @return {Timestamp}
     */
    toFirestore: (timestamp) => {
        try {
            if (!timestamp) {
                logger.warn('Null/undefined timestamp, using current time');
                return Timestamp.now();
            }
            // ... rest of existing logic ...
        } catch (error) {
            throw new ValidationError('Invalid timestamp format', {
                timestampType: typeof timestamp,
                originalError: error.message
            });
        }
    },
    
    /**
     * Safely compare two timestamps of any supported format
     * @param {Date|Timestamp|FieldValue|number} timestamp1
     * @param {Date|Timestamp|FieldValue|number} timestamp2
     * @return {number} Negative if t1 < t2, 0 if equal, positive if t1 > t2
     */
    compare: (timestamp1, timestamp2) => {
        try {
            const t1 = timestamps.toFirestore(timestamp1);
            const t2 = timestamps.toFirestore(timestamp2);
            return t1.toMillis() - t2.toMillis();
        } catch (error) {
            logger.error('Error comparing timestamps', {
                error: error.message,
                timestamp1: timestamp1,
                timestamp2: timestamp2
            });
            throw error;
        }
    },

    /**
     * Check if a value is a valid timestamp
     * @param {any} timestamp
     * @return {boolean}
     */
    isValid: (timestamp) => {
        try {
            timestamps.toFirestore(timestamp);
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Calculate a timestamp from now minus a duration
     * @param {number} duration - Duration in milliseconds
     * @return {Timestamp}
     */
    subtract: (duration) => {
        if (typeof duration !== 'number') {
            throw new ValidationError('Invalid duration value', {
                value: duration,
                expectedType: 'number'
            });
        }
        return Timestamp.fromMillis(Date.now() - duration);
    }
};

module.exports = timestamps;