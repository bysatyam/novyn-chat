import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB1SjYr_LOS4oJ1sE4_Aws4Jg6faayvHT0",
  authDomain: "novyn-chat-app.firebaseapp.com",
  projectId: "novyn-chat-app",
  storageBucket: "novyn-chat-app.firebasestorage.app",
  messagingSenderId: "846944364575",
  appId: "1:846944364575:web:94fd318c693a337d498d2a",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

export async function loginWithGooglePopup(): Promise<{ idToken: string; email?: string; displayName?: string }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const idToken = await user.getIdToken();
  return {
    idToken,
    email: user.email || undefined,
    displayName: user.displayName || undefined,
  };
}
