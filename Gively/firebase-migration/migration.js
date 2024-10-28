const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json'); 

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const migrateDates = async () => {
    console.log('Starting date migration...');
    const postsRef = db.collection('Posts');
    const snapshot = await postsRef.get();
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const doc of snapshot.docs) {
        const postData = doc.data();
        
        // Skip if already a Timestamp
        if (postData.date instanceof admin.firestore.Timestamp) {
            skippedCount++;
            console.log(`Skipped document (already Timestamp): ${doc.id}`);
            continue;
        }
        
        try {
            // Convert string date to Timestamp
            const dateObj = new Date(postData.date);
            const timestamp = admin.firestore.Timestamp.fromDate(dateObj);
            
            // Update document
            await postsRef.doc(doc.id).update({
                date: timestamp
            });
            
            migratedCount++;
            console.log(`Migrated document: ${doc.id}`);
            
        } catch (error) {
            console.error(`Error migrating document ${doc.id}:`, error);
            console.error('Document data:', postData);
            errorCount++;
        }
    }
    
    console.log(`
Migration complete:
- Total documents: ${snapshot.size}
- Documents migrated: ${migratedCount}
- Documents skipped (already Timestamp): ${skippedCount}
- Errors encountered: ${errorCount}
    `);

    // Exit the process after migration
    process.exit(0);
};

// Execute migration
migrateDates().catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
});