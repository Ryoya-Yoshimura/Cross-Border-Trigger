import * as admin from "firebase-admin";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

// ビルド時に環境変数がなくてもエラーにならないようにする
const canInitialize = !!(firebaseAdminConfig.projectId && firebaseAdminConfig.clientEmail && firebaseAdminConfig.privateKey);

if (!admin.apps.length && canInitialize) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
  });
}

const adminAuth = canInitialize ? admin.auth() : ({} as admin.auth.Auth);
const adminDb = canInitialize ? admin.firestore() : ({} as admin.firestore.Firestore);

export { adminAuth, adminDb };
