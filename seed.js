import admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
  projectId: 'demo-northstar'
});

const db = admin.firestore();
const auth = admin.auth();

async function seed() {
  console.log('Seeding data...');

  // 1. Create Level 1 Scholar (Initiate)
  const user1 = await auth.createUser({
    uid: 'scholar-level-1',
    email: 'initiate@northstar.test',
    password: 'password123',
    displayName: 'Initiate Scholar'
  });

  await db.collection('scholars').doc(user1.uid).set({
    displayName: 'Initiate Scholar',
    scholarGrade: 'Initiate',
    level: 1,
    postCount: 0,
    approvedPostIds: [],
    pendingPostId: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 2. Create Level 2 Scholar (Archivist)
  const user2 = await auth.createUser({
    uid: 'scholar-level-2',
    email: 'archivist@northstar.test',
    password: 'password123',
    displayName: 'Archivist Scholar'
  });

  await db.collection('scholars').doc(user2.uid).set({
    displayName: 'Archivist Scholar',
    scholarGrade: 'Archivist',
    level: 2,
    postCount: 1,
    approvedPostIds: ['sample-post-1'],
    pendingPostId: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // 3. Create an Approved Post
  await db.collection('archive').doc('sample-post-1').set({
    authorId: user2.uid,
    title: 'The Nature of Intentionality',
    type: 'research',
    publicContent: 'This is the public part of the research. [REDACTED] It continues here with more public thoughts. [REDACTED] Final public paragraph.',
    redactedContent: 'This is the FIRST secret segment.\n---\nThis is the SECOND secret segment.',
    status: 'approved',
    wordCount: 160,
    isFirstApprovedPost: true,
    publishedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log('Seeding complete.');
}

seed().catch(console.error);
