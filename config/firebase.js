const admin = require("firebase-admin");

// Firebase Admin SDK initialization
let serviceAccount = null;

// Muhit o'zgaruvchilarini tekshirish
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
  try {
    // Environment variables dan foydalanish
    serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY ? 
                   process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : 
                   undefined,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
    };
    
    console.log("Environment variables loaded successfully");
  } catch (error) {
    console.error("Error loading environment variables:", error);
    serviceAccount = null;
  }
} else {
  console.error("Missing required Firebase environment variables");
}

// Firebase-ni ishga tushirish
let db = null;

if (serviceAccount && serviceAccount.private_key) {
  try {
    // Agar allaqachon ishga tushirilgan bo'lsa, yangi app yaratmaslik
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    db = admin.firestore();
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.error("Firebase initialization failed: Missing service account credentials");
}

module.exports = { db };