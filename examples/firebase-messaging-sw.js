// This file is required by firebase.messaging()
// The filename has to be exactly the same and located at root eg. https://example.com/firebase-messaging-sw.js
// or registered before enabling notification eg:
//
// navigator.serviceWorker.register('firebase-messaging-sw.js')
//   .then((registration) => {
//     messaging.useServiceWorker(registration)
//     enableNotification()
//   })


// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js')

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    'messagingSenderId': '371521361553'
})
