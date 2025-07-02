// src/services/firebase.config.ts
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTnCoSMU9-7R2ng4ab-W0xf4Cu7MGFCt4",
  authDomain: "todo-app-7f768.firebaseapp.com",
  projectId: "todo-app-7f768",
  storageBucket: "todo-app-7f768.appspot.com",
  messagingSenderId: "826062630365",
  appId: "1:826062630365:web:690ed7440c06bb0b4f1a34",
  measurementId: "G-0H066095MS"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Get Firestore instance
export const db: Firestore = getFirestore(app);