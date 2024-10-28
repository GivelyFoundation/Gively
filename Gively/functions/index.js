// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.handlePostLike = functions.firestore
    .document('Posts/{postId}/likes/{userId}')
    .onCreate(async (snapshot, context) => {
        const postId = context.params.postId;
        const likerId = context.params.userId;

        try {
            // Get post data
            const postRef = admin.firestore().collection('Posts').doc(postId);
            const postSnap = await postRef.get();
            const postData = postSnap.data();
            
            // Get liker's data
            const likerRef = admin.firestore().collection('users').doc(likerId);
            const likerSnap = await likerRef.get();
            const likerData = likerSnap.get();

            // Get post author's FCM token
            const authorRef = admin.firestore().collection('users').doc(postData.uid);
            const authorSnap = await authorRef.get();
            const authorData = authorSnap.data();
            
            const batch = admin.firestore().batch();

            // 1. Update or create notification document
            const notificationsRef = admin.firestore().collection('notifications');
            const querySnapshot = await notificationsRef
                .where('postId', '==', postId)
                .where('type', '==', 'like')
                .where('recipientId', '==', postData.uid)
                .limit(1)
                .get();

            let notificationDoc;
            if (querySnapshot.empty) {
                notificationDoc = notificationsRef.doc();
                batch.set(notificationDoc, {
                    type: 'like',
                    postId,
                    recipientId: postData.uid,
                    actors: [{
                        userId: likerId,
                        username: likerData.username,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    }],
                    count: 1,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    read: false,
                    groupId: `like_${postId}`
                });
            } else {
                notificationDoc = querySnapshot.docs[0].ref;
                const existingData = querySnapshot.docs[0].data();
                batch.update(notificationDoc, {
                    actors: admin.firestore.FieldValue.arrayUnion({
                        userId: likerId,
                        username: likerData.username,
                        timestamp: admin.firestore.FieldValue.serverTimestamp()
                    }),
                    count: admin.firestore.FieldValue.increment(1),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    read: false
                });
            }

            await batch.commit();

            // 2. Send FCM notification
            if (authorData.fcmToken) {
                const message = {
                    token: authorData.fcmToken,
                    notification: {
                        title: 'New Like',
                        body: querySnapshot.empty ? 
                            `${likerData.username} liked your post` :
                            `${likerData.username} and ${existingData.count} others liked your post`
                    },
                    data: {
                        type: 'like',
                        postId: postId,
                        notificationId: notificationDoc.id
                    }
                };

                await admin.messaging().send(message);
            }

            return null;
        } catch (error) {
            console.error('Error handling post like:', error);
            return null;
        }
    });

exports.handlePostUnlike = functions.firestore
    .document('Posts/{postId}/likes/{userId}')
    .onDelete(async (snapshot, context) => {
        const postId = context.params.postId;
        const unlikerId = context.params.userId;

        try {
            const notificationsRef = admin.firestore().collection('notifications');
            const querySnapshot = await notificationsRef
                .where('postId', '==', postId)
                .where('type', '==', 'like')
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const notification = querySnapshot.docs[0];
                const notificationData = notification.data();

                const updatedActors = notificationData.actors.filter(
                    actor => actor.userId !== unlikerId
                );

                if (updatedActors.length === 0) {
                    await notification.ref.delete();
                } else {
                    await notification.ref.update({
                        actors: updatedActors,
                        count: updatedActors.length,
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
            }

            return null;
        } catch (error) {
            console.error('Error handling post unlike:', error);
            return null;
        }
    });