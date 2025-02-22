const { db } = require('../config/firebase');


const recordErrorMetric = async (error, context) => {
    const metricData = {
        errorMessage: error.message,
        errorStack: error.stack,
        errorCode: error.code || 'unknown',
        severity: context.severity || 'error',
        source: context.source || 'system',
        timestamp: Date.now()
    };
    await db.collection('error_metrics').add(metricData);
};

module.exports = { recordErrorMetric };