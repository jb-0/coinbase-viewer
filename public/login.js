window.addEventListener('DOMContentLoaded', () => {
  const firebaseConfig = {
    apiKey: 'AIzaSyCKZ9dfFYc-C6XxMf-K8keg3mp0Jin5CFI',
    authDomain: 'coinbase-viewer.firebaseapp.com',
    projectId: 'coinbase-viewer',
    storageBucket: 'coinbase-viewer.appspot.com',
    messagingSenderId: '1083630918508',
    appId: '1:1083630918508:web:43b9d195b4c64c3e9c3149',
  };

  firebase.initializeApp(firebaseConfig);

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

  document
    .getElementById('login')
    .addEventListener('submit', (event) => {
      event.preventDefault();
      const login = event.target.login.value;
      const password = event.target.password.value;

      firebase
        .auth()
        .signInWithEmailAndPassword(login, password)
        .then(({ user }) => {
          return user.getIdToken().then((idToken) => {
            return fetch('/sessionLogin', {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ idToken }),
            });
          });
        })
        .then(() => {
          return firebase.auth().signOut();
        })
        .then(() => {
          window.location.assign('/accounts');
        });
      return false;
    });
});