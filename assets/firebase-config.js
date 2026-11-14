// Firebase project settings (Firebase console → Project settings → Your apps → Web app → Config).
// These values identify the project; they are not secrets. Data is protected by firestore.rules.
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBb6NDYRfNeEwo7uJN1nHr0dp_1urfbXEs',
  authDomain: 'kiokuyeon.firebaseapp.com',
  projectId: 'kiokuyeon',
  appId: '1:131626121272:web:4db0207d7fa6e94b32cecd',
  messagingSenderId: '131626121272',
};

// Extra sign-in buttons for members. Set microsoft to true after the Microsoft provider is
// enabled in Firebase Authentication (needs an app registered in Microsoft Azure — see README).
window.AUTH_OPTIONS = { microsoft: false };
