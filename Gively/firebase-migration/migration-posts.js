const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const migratePostFields = async () => {
    console.log('Starting posts field migration...');
    const postsRef = db.collection('Posts');
    const snapshot = await postsRef.get();
    
    let migratedCount = 0;
    let errorCount = 0;
    
    let batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    const newPostsRef = db.collection('posts');
    
    for (const doc of snapshot.docs) {
        try {
            const oldData = doc.data();
            
            // Base fields that all posts have
            const newData = {
                id: oldData.id,
                uid: oldData.uid,
                postType: oldData.PostType?.toLowerCase() || oldData.PostType, // Maintain case if needed
                likers: oldData.Likers || [],
                date: oldData.date,
            };

            // Add type-specific fields if they exist
            if (oldData.Link) newData.link = oldData.Link;
            if (oldData.postText) newData.postText = oldData.postText;
            if (oldData.description) newData.description = oldData.description;
            if (oldData.eventDate) newData.eventDate = oldData.eventDate;
            if (oldData.location) newData.location = oldData.location;
            if (oldData.address) newData.address = oldData.address;
            if (oldData.charity) newData.charity = oldData.charity;
            if (oldData.timestamp) newData.timestamp = oldData.timestamp;
            if (oldData.originalDonationPoster) newData.originalDonationPoster = oldData.originalDonationPoster;
            if (oldData.originalPosterProfileImage) newData.originalPosterProfileImage = oldData.originalPosterProfileImage;
            
            // Create document in new collection with same ID
            const newDocRef = newPostsRef.doc(doc.id);
            batch.set(newDocRef, newData);
            
            // Delete document from old collection
            const oldDocRef = postsRef.doc(doc.id);
            batch.delete(oldDocRef);
            
            batchCount++;
            
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                migratedCount += batchCount;
                console.log(`Migrated ${migratedCount} documents`);
                
                batch = db.batch();
                batchCount = 0;
            }
            
        } catch (error) {
            console.error(`Error migrating document ${doc.id}:`, error);
            console.error('Document data:', doc.data());
            errorCount++;
        }
    }
    
    if (batchCount > 0) {
        await batch.commit();
        migratedCount += batchCount;
    }
    
    console.log(`
Migration complete:
- Total documents: ${snapshot.size}
- Documents migrated: ${migratedCount}
- Errors encountered: ${errorCount}
    `);

    // Verification step
    const verificationDoc = (await newPostsRef.limit(1).get()).docs[0];
    if (verificationDoc) {
        const verificationData = verificationDoc.data();
        console.log('Verification sample:', verificationData);
    }

    process.exit(0);
};

// Add rollback functionality
const rollbackMigration = async () => {
    console.log('Starting rollback...');
    const newPostsRef = db.collection('posts');
    const oldPostsRef = db.collection('Posts');
    const snapshot = await newPostsRef.get();
    
    let batch = db.batch();
    let batchCount = 0;
    let rolledBackCount = 0;
    
    for (const doc of snapshot.docs) {
        try {
            const newData = doc.data();
            
            // Transform back to old format
            const oldData = {
                ...newData,
                PostType: newData.postType?.toUpperCase() || newData.postType,
                Likers: newData.likers || [],
            };
            
            if (newData.link) oldData.Link = newData.link;
            
            // Remove new camel case fields
            delete oldData.postType;
            delete oldData.link;
            delete oldData.likers;
            
            const oldDocRef = oldPostsRef.doc(doc.id);
            batch.set(oldDocRef, oldData);
            
            const newDocRef = newPostsRef.doc(doc.id);
            batch.delete(newDocRef);
            
            batchCount++;
            
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                rolledBackCount += batchCount;
                console.log(`Rolled back ${rolledBackCount} documents`);
                
                batch = db.batch();
                batchCount = 0;
            }
        } catch (error) {
            console.error(`Error rolling back document ${doc.id}:`, error);
        }
    }
    
    if (batchCount > 0) {
        await batch.commit();
        rolledBackCount += batchCount;
    }
    
    console.log(`Rollback completed: ${rolledBackCount} documents restored`);
    process.exit(0);
};

// Execute migration or rollback based on command line argument
const args = process.argv.slice(2);
if (args[0] === '--rollback') {
    rollbackMigration().catch(error => {
        console.error('Rollback failed:', error);
        process.exit(1);
    });
} else {
    migratePostFields().catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}