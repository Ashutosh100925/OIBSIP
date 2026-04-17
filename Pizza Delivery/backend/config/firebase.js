const admin = require('firebase-admin');
const path = require('path');

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (err) {
  console.warn('WARNING: firebase/config/serviceAccountKey.json not found. Backend will not connect to Firestore.');
}

if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Optional: Enable offline persistence or other settings if needed
// db.settings({ ignoreUndefinedProperties: true });

module.exports = { admin, db };
