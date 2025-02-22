function validatePushToken(token) {
    if (typeof token !== 'string') return false;
    return /^ExponentPushToken\[[A-Za-z0-9_-]+\]$/.test(token);
}
  
module.exports = { validatePushToken };