const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const migratePostIds = async () => {
    console.log('Starting post ID migration...');
    const postsRef = db.collection('Posts');
    const snapshot = await postsRef.get();
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Create a batch
    let batch = db.batch();
    let batchCount = 0;
    const BATCH_SIZE = 500;
    
    for (const doc of snapshot.docs) {
        const postData = doc.data();
        const nativeId = doc.id;
        const customId = postData.id;
        
        // Skip if IDs already match
        if (customId === nativeId) {
            skippedCount++;
            console.log(`Skipped document (IDs match): ${doc.id}`);
            continue;
        }
        
        try {
            // Update the post document
            const postRef = postsRef.doc(nativeId);
            batch.update(postRef, {
                id: nativeId,
                lastMigrated: admin.firestore.FieldValue.serverTimestamp()
            });
            
            batchCount++;
            
            // Check for references in likes collection
            const likesSnapshot = await db.collection('likes')
                .where('postId', '==', customId)
                .get();
                
            for (const likeDoc of likesSnapshot.docs) {
                const likeRef = db.collection('likes').doc(likeDoc.id);
                batch.update(likeRef, {
                    postId: nativeId
                });
                batchCount++;
            }
            
            // If batch is getting full, commit and start new batch
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                migratedCount += batchCount;
                console.log(`Migrated ${migratedCount} operations`);
                
                // Start new batch
                batch = db.batch();
                batchCount = 0;
            }
            
        } catch (error) {
            console.error(`Error migrating document ${doc.id}:`, error);
            console.error('Document data:', postData);
            errorCount++;
        }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
        await batch.commit();
        migratedCount += batchCount;
    }
    
    console.log(`
Migration complete:
- Total documents: ${snapshot.size}
- Operations completed: ${migratedCount}
- Documents skipped: ${skippedCount}
- Errors encountered: ${errorCount}
    `);

    // Verification step
    const verificationDoc = (await postsRef.limit(1).get()).docs[0];
    if (verificationDoc) {
        const verificationData = verificationDoc.data();
        console.log('Verification check:', {
            nativeId: verificationDoc.id,
            storedId: verificationData.id,
            match: verificationDoc.id === verificationData.id
        });
    }

    // Exit the process
    process.exit(0);
};

// Add rollback functionality
const rollbackMigration = async () => {
    console.log('Starting rollback...');
    const postsRef = db.collection('posts');
    const snapshot = await postsRef.get();
    
    let batch = db.batch();
    let batchCount = 0;
    let rolledBackCount = 0;
    
    for (const doc of snapshot.docs) {
        const postData = doc.data();
        
        // Only rollback migrated documents
        if (postData.lastMigrated) {
            const postRef = postsRef.doc(doc.id);
            batch.update(postRef, {
                id: postData.originalId || postData.customId, // Use whatever field stored the original ID
                lastMigrated: admin.firestore.FieldValue.delete()
            });
            
            batchCount++;
            
            if (batchCount >= BATCH_SIZE) {
                await batch.commit();
                rolledBackCount += batchCount;
                console.log(`Rolled back ${rolledBackCount} documents`);
                
                batch = db.batch();
                batchCount = 0;
            }
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
    migratePostIds().catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
}