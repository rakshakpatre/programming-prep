// config/FirebaseAdmin.js
import admin from "firebase-admin";
import fs from "fs";

// Safely read your service account JSON
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  // fs.readFileSync("./config/serviceAccountKey.json", "utf8")
// );

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

export default db;
