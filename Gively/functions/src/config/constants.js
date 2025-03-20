const FUNCTION_CONFIG = {
    DEFAULT: {
        region: 'us-central1',
        memory: '256MiB',
        timeoutSeconds: 60,
    },
    MAINTENANCE: {
        region: 'us-central1',
        memory: '512MiB',
        timeoutSeconds: 540,
    },
};

const NOTIFICATION_TYPES = {
    LIKE: 'like',
    LIKE_MULTIPLE: 'like_multiple',
    LIKE_GROUP: 'like_group'
};
  
const TIME_WINDOWS = {
    NOTIFICATION_GROUP: {
        LIKE: 1800000,               // 30 min for same post
        LIKE_MULTIPLE: 1800000,      // 30 min for same user
        DEFAULT: 1800000
    }
};
  
const PUSH_CONFIGS = {
    API_URL: 'https://exp.host/--/api/v2/push/send',
    RETRY_COUNT: 3,
    BATCH_SIZE: 100,
    ERROR_CODES: {
        INVALID_TOKEN: ['PUSH_TOK_INVALID', 'PUSH_TOK_EXPIRED'],
        RATE_LIMIT: ['PUSH_TOO_MANY_REQUESTS'],
        SERVER: ['PUSH_SERVER_ERROR']
    }
};
  
module.exports = {
    NOTIFICATION_TYPES,
    TIME_WINDOWS,
    PUSH_CONFIGS,
    FUNCTION_CONFIG
};