//  "firebase.ts"
//  metropolitan app
//  Created by Ahmet on 08.08.2025.

import firebase from "@react-native-firebase/app";

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyCpI92g4zEud0eBgLO2uEklW7Qoy0jh4lQ",
  authDomain: "metropolitan-be3a9.firebaseapp.com",
  projectId: "metropolitan-be3a9",
  storageBucket: "metropolitan-be3a9.firebasestorage.app",
  messagingSenderId: "997946475608",
  appId: "1:997946475608:ios:f9cec04f956da27cf7762d",
};

// Firebase'i başlat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
