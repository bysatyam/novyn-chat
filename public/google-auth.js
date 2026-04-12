/* Google OAuth for Novyn Chat - Firebase Web SDK */

const firebaseConfig = {
  apiKey: "AIzaSyB1SjYr_LOS4oJ1sE4_Aws4Jg6faayvHT0",
  authDomain: "novyn-chat-app.firebaseapp.com",
  projectId: "novyn-chat-app",
  storageBucket: "novyn-chat-app.firebasestorage.app",
  messagingSenderId: "846944364575",
  appId: "1:846944364575:web:94fd318c693a337d498d2a",
};

function initializeFirebaseAuth() {
  if (!window.firebase || typeof window.firebase.initializeApp !== "function") {
    console.warn("Firebase SDK is not loaded.");
    return null;
  }
  if (!window.firebase.apps || window.firebase.apps.length === 0) {
    window.firebase.initializeApp(firebaseConfig);
  }
  return window.firebase.auth ? window.firebase.auth() : null;
}

function signInWithGoogle() {
  const auth = initializeFirebaseAuth();
  if (!auth) {
    return Promise.reject(new Error("Firebase auth unavailable."));
  }

  const provider = new window.firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider)
    .then(async (result) => {
      const user = result.user;
      if (!user) {
        throw new Error("Google sign-in returned no user.");
      }
      const idToken = typeof user.getIdToken === "function"
        ? await user.getIdToken()
        : "";
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        idToken,
      };
    })
    .catch((error) => {
      console.error("Google sign-in failed", error);
      throw error;
    });
}

