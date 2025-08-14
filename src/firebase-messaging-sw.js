
importScripts(
  'https://www.gstatic.com/firebasejs/9.8.0/firebase-app-compat.js',
);
importScripts(
  'https://www.gstatic.com/firebasejs/9.8.0/firebase-messaging-compat.js',
);

const app = firebase.initializeApp({
  apiKey: "AIzaSyA3ZeDebp8fG-HUHTPql2ghvpkmOtANEV0",
  authDomain: "praticboutic.firebaseapp.com",
  projectId: "praticboutic",
  storageBucket: "praticboutic.appspot.com",
  messagingSenderId: "50443410557",
  appId: "1:50443410557:web:a892fed9cb46b5d641a514",
  measurementId: "G-D01JJ57K7K",
  vapidKey: "BIxOsThgJHwgk9G89iCaxyhZ1Em3Vly4QjJWt88aJPJKkzRnciJO3UHKz5h_hS3klzFzk0B4hIFfCzcM-ykVqR8"
});

//const messaging = firebase.messaging(app);

const messaging = firebase.messaging();

/*onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload.data);    
  var notificationTitle = payload.data.Title;
  var notificationOptions = {
      body: payload.data.Body,
      icon: payload.data.Icon,
      image: payload.data.Image,
      action: payload.data.ClickAction
  };
  console.log("strated sending msg" + notificationOptions);
  return self.registration.showNotification(notificationTitle,notificationOptions);
});*/

/*messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  console.log('[firebase-messaging-sw.js] Received background message ', payload.data);    
  var notificationTitle = payload.data.Title;
  var notificationOptions = {
      body: payload.data.Body,
      icon: payload.data.Icon,
      image: payload.data.Image,
      action: payload.data.ClickAction
  };
  console.log("strated sending msg from js" + notificationOptions);
  return self.registration.showNotification(notificationTitle,notificationOptions);
});


addEventListener('notificationclick', (event) => {
  const clickedNotification = event.notification;
  // Do something as the result of the notification click
  const promiseChain = clients.openWindow(clickedNotification.fcmOptions?.link);
  console.log('notificationclick from js :' + event);
  event.waitUntil(promiseChain);
});*/