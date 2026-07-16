const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/skillhub';
const ATLAS_URI = 'mongodb+srv://akashguptaa0702_db_user:xWtnIr70q2L0hDwe@akash007.ohyg3b1.mongodb.net/skillhub?retryWrites=true&w=majority&appName=Akash007';

async function migrate() {
  console.log('Connecting to Local DB...');
  const localDb = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local DB.');

  console.log('Connecting to Atlas DB...');
  const atlasDb = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('Connected to Atlas DB.');

  const collections = ['users', 'courses', 'enrollments', 'submissions', 'reviews', 'notifications'];

  for (const collectionName of collections) {
    console.log(`Migrating ${collectionName}...`);
    try {
        const localCollection = localDb.collection(collectionName);
        const docs = await localCollection.find({}).toArray();
        
        if (docs.length > 0) {
            const atlasCollection = atlasDb.collection(collectionName);
            // Clear existing data to prevent duplicate keys if they already created some
            await atlasCollection.deleteMany({}); 
            await atlasCollection.insertMany(docs);
            console.log(`Successfully migrated ${docs.length} documents for ${collectionName}`);
        } else {
            console.log(`No documents found in ${collectionName}`);
        }
    } catch (err) {
        console.error(`Error migrating ${collectionName}:`, err.message);
    }
  }

  await localDb.close();
  await atlasDb.close();
  console.log('Migration complete!');
}

migrate();
