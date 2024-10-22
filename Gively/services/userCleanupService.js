export const userCleanupService = {
    // Function to handle user deletion
    handleUserDeletion: async (userId) => {
        const batch = writeBatch(firestore);
        
        // 1. Find all posts by the user
        const userPosts = await getDocs(
            query(collection(firestore, 'Posts'), 
            where('uid', '==', userId))
        );

        // 2. Option A: Delete the posts
        userPosts.forEach(post => {
            batch.delete(post.ref);
        });

        // OR Option B: Update posts to mark as from deleted user
        // userPosts.forEach(post => {
        //     batch.update(post.ref, {
        //         deletedUser: true,
        //         originalPosterProfileImage: null,
        //         originalDonationPoster: 'Deleted User'
        //     });
        // });

        // 3. Remove user from others' following/followers lists
        const followersRef = collection(firestore, `users/${userId}/followers`);
        const followingRef = collection(firestore, `users/${userId}/following`);

        const followers = await getDocs(followersRef);
        const following = await getDocs(followingRef);

        followers.forEach(async (follower) => {
            const followerDoc = doc(firestore, 'users', follower.id, 'following', userId);
            batch.delete(followerDoc);
        });

        following.forEach(async (followed) => {
            const followedDoc = doc(firestore, 'users', followed.id, 'followers', userId);
            batch.delete(followedDoc);
        });

        // 4. Execute all operations
        await batch.commit();
    }
};