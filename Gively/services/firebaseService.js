import { firestore } from './firebaseConfig';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    updateDoc, 
    arrayUnion, 
    arrayRemove, 
    addDoc, 
    serverTimestamp,
    limit,
    orderBy,
    startAfter
} from 'firebase/firestore';

export const firebaseService = {
    // Fetch posts with pagination
    getPosts: async (lastVisible, followedUsers = null, postLimit = 10) => {
        // console.log('getPosts called with:', { lastVisible, followedUsers, postLimit });
        console.log('fetching posts')
        const postsRef = collection(firestore, 'Posts');
        let q;

        if (followedUsers && followedUsers.length > 0) {
            // Friends feed
            q = query(
                postsRef,
                where('uid', 'in', followedUsers),
                orderBy('date', 'desc'),
                limit(postLimit)
            );
        } else {
            // For You feed
            q = query(
                postsRef,
                orderBy('date', 'desc'),
                limit(postLimit)
            );
        }

        if (lastVisible) {
            q = query(q, startAfter(lastVisible));
        }

        const querySnapshot = await getDocs(q);
        // console.log('getPosts called with:', { lastVisible, followedUsers, postLimit });
        const posts = await Promise.all(
            querySnapshot.docs.map(async (postDoc) => {
                const postData = postDoc.data();
                try {
                    const userDoc = await getDoc(doc(firestore, 'users', postData.uid));
                    if (!userDoc.exists()) {
                        // Option 1: Skip posts from deleted users
                        return null;

                        // Option 2: Use fallback data for deleted users
                        // return {
                        //     id: postDoc.id,
                        //     ...postData,
                        //     posterData: {
                        //         displayName: 'Deleted User',
                        //         profilePicture: null, // Use a default image URL
                        //         username: 'deleted_user'
                        //     }
                        // };
                    }

                    const userData = userDoc.data();
                    return {
                        id: postDoc.id,
                        ...postData,
                        Likers: postData.Likers || [],
                        posterData: {
                            displayName: userData.displayName,
                            profilePicture: userData.profilePicture,
                            username: userData.username
                        }
                    };
                } catch (error) {
                    console.error(`Error fetching user data for post ${postDoc.id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null posts (from deleted users or errors)
        const validPosts = posts.filter(post => post !== null);

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        return { posts: validPosts, lastVisibleDoc };
    },

    // Like a post
    likePost: async (postId, userId, username, postOwnerId) => {
        const postRef = doc(firestore, 'Posts', postId);
        await updateDoc(postRef, {
            Likers: arrayUnion(userId)
        });
        const notification = {
            message: `${username} liked your post!`,
            timestamp: serverTimestamp(),
            postId: postId,
            user: userId,
            type: "like",
            notificationId: postId + userId
        };
        await addDoc(collection(firestore, 'users', postOwnerId, 'notifications'), notification);
    },

    // Unlike a post
    unlikePost: async (postId, userId) => {
        const postRef = doc(firestore, 'Posts', postId);
        await updateDoc(postRef, {
            Likers: arrayRemove(userId)
        });
    },

    // Check if a user has liked a post
    hasUserLikedPost: async (postId, userId) => {
        try {
            const postRef = doc(firestore, 'Posts', postId);
            const docSnapshot = await getDoc(postRef);
            if (!docSnapshot.exists()) return false;
            
            const likers = docSnapshot.data().Likers || [];
            return likers.includes(userId);
        } catch (error) {
            console.error('Error checking if user liked post:', error);
            return false;
        }
    },

    // Remove a notification
    removeNotification: async (postOwnerId, notificationId) => {
        const notificationsRef = collection(firestore, 'users', postOwnerId, 'notifications');
        const q = query(notificationsRef, where("notificationId", "==", notificationId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach(async (doc) => {
                await doc.ref.delete();
            });
        }
    },

    createPost: async (postData) => {
        try {
            const postsRef = collection(firestore, 'Posts');
            const docRef = await addDoc(postsRef, {
                ...postData,
                date: serverTimestamp(), // Use server timestamp for consistency
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

};