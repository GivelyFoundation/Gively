// utils/firebaseErrorHandler.js

export const getReadableErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
        return 'No account found with this email. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again or reset your password.';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later or reset your password.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/popup-closed-by-user':
        return 'The login popup was closed. Please try again.';
      case 'auth/operation-not-allowed':
        return 'This login method is not enabled. Please try a different method or contact support.';
      case 'auth/weak-password':
        return 'The password is too weak. Please choose a stronger password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please login or use a different email.';
      case 'auth/invalid-login-credentials':
        return 'Invalid login credentials. Please check your email and password and try again.';
      case 'auth/missing-password':
        return 'Please enter a password.';
      default:
        console.error('Unhandled Firebase error:', error.code, error.message);
        return 'An unexpected error occurred. Please try again later.';
    }
  };