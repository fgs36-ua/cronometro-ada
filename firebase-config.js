// Configuración de Firebase para el Cronómetro ADA
const firebaseConfig = {
    apiKey: "AIzaSyD-NC3a3TyAQe7kGE4aF2D2FkssQWIy0HY",
    authDomain: "cronometroada.firebaseapp.com",
    projectId: "cronometroada",
    storageBucket: "cronometroada.firebasestorage.app",
    messagingSenderId: "1035349099368",
    appId: "1:1035349099368:web:52b183cd7752484cd90cdd",
    measurementId: "G-X9VETLSN7G"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Inicializar App Check con reCAPTCHA v3
const appCheck = firebase.appCheck();
appCheck.activate('6LfJx1YrAAAAAEyIjPlaydguIXAobdsPjVVjoBTl', true); // Reemplaza con tu site key

// Obtener referencia a Firestore
const db = firebase.firestore();

// Configuración offline para Firestore
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            console.log('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
        } else if (err.code == 'unimplemented') {
            console.log('The current browser does not support all of the features required to enable persistence');
        }
    });
