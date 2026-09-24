import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required');

await mongoose.connect(uri);
try {
  const users = mongoose.connection.collection('users');
  const indexes = await users.listIndexes().toArray();
  for (const index of indexes) {
    if (index.key?.googleSub === 1 && !index.sparse) {
      await users.dropIndex(index.name);
    }
  }
  await users.createIndex(
    { googleSub: 1 },
    { unique: true, sparse: true, name: 'googleSub_1' },
  );
  await users.createIndex(
    { appleSub: 1 },
    { unique: true, sparse: true, name: 'appleSub_1' },
  );
  console.log('Apple identity indexes are ready');
} finally {
  await mongoose.disconnect();
}