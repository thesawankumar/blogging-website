import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDxm5MK6N_k934f-DeRE4tdpxScFihZWvc",
  authDomain: "blogging-website-7a22c.firebaseapp.com",
  projectId: "blogging-website-7a22c",
  storageBucket: "blogging-website-7a22c.appspot.com",
  messagingSenderId: "853371185278",
  appId: "1:853371185278:web:03155cbb84e6cc5604102f",
};

const app = initializeApp(firebaseConfig);

//google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {
  let user = null;
  await signInWithPopup(auth, provider)
    .then((result) => {
      user = result.user;
    })
    .catch((err) => {
      console.log(err);
    });

  return user;
};
