
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: 將你在 Firebase 控制台取得的設定貼在這裡
const firebaseConfig = {
    apiKey: "AIzaSyDL1qJykOYEVd9jOtBEzv9UG757xakaFho",
    authDomain: "yj-card-system.firebaseapp.com",
    projectId: "yj-card-system",
    storageBucket: "yj-card-system.firebasestorage.app",
    messagingSenderId: "664246238342",
    appId: "1:664246238342:web:f42fc1294796c836a02507"
};


// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 匯出實例供其他檔案使用
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
