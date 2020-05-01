const auth = firebase.auth()

//toggle the auth models
function toggleAuth(){
  document.querySelectorAll('#modal-auth .modal-content').forEach(modal => {
    if (modal.style.display == 'none'){
      modal.style.display = 'block';
    }else{
      modal.style.display = 'none';
    }
  });
};
const authSwitchLinks = document.querySelectorAll('.switch');
authSwitchLinks.forEach(link => {
  link.addEventListener('click', () => {
    toggleAuth();
  });
});


// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;
  const username = signupForm['signup-username'].value;

  // sign up the user & add firestore data
  auth.createUserWithEmailAndPassword(email, password)
  .then(cred => {
    var user = firebase.auth().currentUser;
    user.sendEmailVerification().then(function() {
      showNotification('A verification email has been send');
    }).catch(function(error) {
      showNotification(error.message);

    });
     const addUsername = firebase.functions().httpsCallable('addUsername');
     return addUsername({
       id: cred.user.uid,
       username: username
     });
     
  }).then(() => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-auth');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
    signupForm.querySelector('.error').innerHTML ='';
  }).catch(function (err) {
    signupForm.querySelector('.error').innerHTML = err.message;

  });
});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut().then(() => {
    console.log('signed out')
  })
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-auth');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
    loginForm.querySelector('.error').innerHTML = '';
  }).catch(err => {
    loginForm.querySelector('.error').innerHTML = err.message;
  });
});

//change password
const resetPasswordForm = document.querySelector('#resetPassword-form');
resetPasswordForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  auth.sendPasswordResetEmail(resetPasswordForm.email.value).then(function() {
    showNotification('An email has been send');
    }).catch(function(error) {
      showNotification(error.message)
    });
});

// setup accout details
function accountModal(){
  var user = auth.currentUser;
  if(user){
    db.collection('users').doc(user.uid).get().then(function (doc){
      const html=`
      <div>Logged in as ${user.email} </div>
      <div>${doc.data().username } </div>
      <div class='pink-text '>${user.admin ? 'Admin':''} </div>
      <div class='pink-text '>${user.emailVerified ? 'Your email has been verified':'Your email has not been varified'} </div>
      `;
      accountDetails.innerHTML=html;
    });
  } else{
    const html=`
    <div>You are not logged in. </div>
    `;
    accountDetails.innerHTML=html;
  }
};

// add admin
const addAdminForm = document.querySelector('#addAdmin-form');
addAdminForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const addAdminRole = functions.httpsCallable('addAdminRole');
  addAdminRole({
    email: addAdminForm.email.value
  }).then(() => {
    // close the create modal & reset form
    const modal = document.querySelector('#modal-addAdmin');
    M.Modal.getInstance(modal).close();
    addAdminForm.reset();
  }).catch(err => {
    addAdminForm.querySelector('.error').innerHTML = err.message;
  });
});
