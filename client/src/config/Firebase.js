import firebase from "firebase/app";
import "firebase/auth";
import 'firebase/firestore';
import 'firebase/database';
import environtment from "./config"
const firebaseConfig = environtment.firebaseConfig
const Firebase = firebase.initializeApp(firebaseConfig)
export default Firebase