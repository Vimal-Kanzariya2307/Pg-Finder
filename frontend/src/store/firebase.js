import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDvTFcCrIUIbHa8o5HFWCfr2OPHp64oYrc",

    authDomain: "pgfinder-74bcf.firebaseapp.com",

    projectId: "pgfinder-74bcf",

    storageBucket: "pgfinder-74bcf.firebasestorage.app",

    messagingSenderId: "836215522841",

    appId: "1:836215522841:web:3c797ca12d7b1f2c3d0c88",


};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);