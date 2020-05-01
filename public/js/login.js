const auth = firebase.auth()

// login
const loginForm = document.querySelector('.login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // get user info
  console.log('je komt hier')

  const email = document.getElementById("e-mailadres").value;
  const password = document.getElementById("password").value;
  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    console.log('je bent nu ingelogd')
  }).catch(err => {
    console.log(err.message);
    console.log(err.message);
  });
});
