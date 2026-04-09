import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyBvHz_5IXNgn06GLob5Zv_7wrwjBHlMstU',
  authDomain: 'neernetra-2a9c9.firebaseapp.com',
  databaseURL: 'https://neernetra-2a9c9-default-rtdb.firebaseio.com',
  projectId: 'neernetra-2a9c9',
  storageBucket: 'neernetra-2a9c9.firebasestorage.app',
  messagingSenderId: '684261473817',
  appId: '1:684261473817:web:f22e650264f9ff3e41f488',
};

export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
