const auth = firebase.auth()

// signup
const signupForm = document.querySelector('.signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = document.getElementById("e-mailadres").value;
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value;
  const lastName = document.getElementById("lastName").value;

  // sign up the user & add firestore data
  auth.createUserWithEmailAndPassword(email, password)
  .then(cred => {
    var user = firebase.auth().currentUser;
    user.sendEmailVerification().then(function() {
      console.log('A verification email has been send');
    }).catch(function(error) {
      console.log(error.message);

    });
     const addUsername = firebase.functions().httpsCallable('addUsername');
     addUsername({
       id: cred.user.uid,
       variableName: 'lastName',
       variableValue: lastName
     })
     return addUsername({
       id: cred.user.uid,
       variableName: 'username',
       variableValue: username
     });

  }).then(() => {
    // close the signup modal & reset form
    console.log("you succesfully sign up")
  }).catch(function (err) {
    console.log("there has been an error")
    console.log(err.message)

  });
});
