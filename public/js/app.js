const guideList = document.querySelector('.guides');

// listen for auth status changes
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('user logged in: ', user);
    db.collection('articles').orderBy('upvotes', 'desc').onSnapshot(snapshot => {
      guideList.innerHTML='';
      snapshot.docs.forEach(doc => renderArticle(doc));
      user.getIdTokenResult().then(idTokenResult=>{
        user.admin =idTokenResult.claims.admin
        setupUI(user)
      });
    }, function(error) {
      showNotification(error.message);
    });

  } else {
    console.log('user logged out');
    setupUI(user)

    db.collection('articles').onSnapshot(snapshot => {
      guideList.innerHTML='';
      
      snapshot.docs.forEach(doc => renderArticle(doc));
      setupUI(user)
    }, function(error) {
        showNotification(error.message);
    });
  }
});
