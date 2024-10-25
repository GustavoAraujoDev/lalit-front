// firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAXDfdRG9H2rK2mEnCUaXLMVuHObWfvCsE",
    authDomain: "testes-19dc4.firebaseapp.com",
    projectId: "testes-19dc4",
    storageBucket: "testes-19dc4.appspot.com",
    messagingSenderId: "400866154921",
    appId: "1:400866154921:web:ba0e427bf2243030334cb8"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };