// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnzS4g6twOXAao5XvTzgAlENZYKiVfKU0",
  authDomain: "bazaarbuddy-628f1.firebaseapp.com",
  projectId: "bazaarbuddy-628f1",
  storageBucket: "bazaarbuddy-628f1.firebasestorage.app",
  messagingSenderId: "442023625710",
  appId: "1:442023625710:web:6458f09e3e15b4a9d5c4ff"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();