const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();


exports.createUserDocument = functions.auth.user().onCreate((user) => {
  const {email, uid} = user;

  return admin.firestore().collection("users").doc(uid).set({
    email: email,
  });
});

/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");



// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// exports.createUserDocument = functions.auth.user().onCreate((user) => {
//     const { email, uid } = user;
//     const displayName = user.displayName || 'New User';

//     return admin.firestore().collection('users').doc(uid).set({
//         email: email,
//         displayName: displayName,
//         username: '',
//         // created: admin.firestore.FieldValue.serverTimestamp() // Attempt to use serverTimestamp again
//     });
// });