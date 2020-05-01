const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    upvotedOn: [],
    downvotedOn:[],
  },{merge:true});
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

// http callable function (adding a request)
exports.addUsername = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can add a username'
    );
  }
  if (data.variableValue.length > 30) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Username must be no more than 30 characters long'
    );
  }
  return admin.firestore().collection('users').doc(data.id).set({
    [data.variableName]: data.variableValue
  },{merge:true});
});

// http callable function
//adding an article
exports.addArticle = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can add requests'
    );
  }
  //check request is made by an admin
  if (context.auth.token.admin !== true){
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only admins can add articles'
    );
  }
  return admin.firestore().collection('articles').add({
    title: data.title,
    content: data.content,
    upvotes: 0,
    by: data.username,
    lastEdit: new Date()
  });
});

exports.editArticle = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users'
    );
  }

  //check request is made by an admin
  if (context.auth.token.admin !== true){
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only admins can edit articles'
    );
  }
  return admin.firestore().collection('articles').doc(data.id).update({
    title: data.title,
    content: data.content,
    by:data.username,
    lastEdit: new Date()
  });
});

// callable
// delete an article
exports.deleteArticle = functions.https.onCall((data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can vote on articles'
    );
  }
  //check request is made by an admin
  if (context.auth.token.admin !== true){
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only admins can add admins'
    );
  }

  const doc = admin.firestore().collection('articles').doc(data.id);
  return doc.delete();
});

// http callable function
//adding a comment
exports.addComment = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'login to leave comments'
    );
  }
  //check comment is made by user with verified email

  if (context.auth.token.email_verified !== true){
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Please verify your email address first'
    );
  }
  return admin.firestore().collection('articles').doc(data.articleId).collection('comments').add({
    user: data.username,
    content: data.content,
    upvotes: 0,
    createdOn: new Date()
  });
});

// upvote callable function
exports.upvote = functions.https.onCall(async(data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Log in to vote'
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const article = admin.firestore().collection('articles').doc(data.id);

  const doc = await user.get()
  // check thew user hasn't already upvoted
  if(doc.data().upvotedOn.includes(data.id)){
    throw new functions.https.HttpsError(
      'failed-precondition',
      'You can only vote something up once'
    );
  }

  if(doc.data().downvotedOn.includes(data.id)){
    await user.update({
      upvotedOn: admin.firestore.FieldValue.arrayUnion(data.id),
      downvotedOn:admin.firestore.FieldValue.arrayRemove(data.id),
    });
    // update the votes on the request
    return article.update({
      upvotes: admin.firestore.FieldValue.increment(2)
    });
  }else{
    // update the array in user document
    await user.update({
      upvotedOn: admin.firestore.FieldValue.arrayUnion(data.id),
    });
    // update the votes on the request
    return article.update({
      upvotes: admin.firestore.FieldValue.increment(1)
    });
  }
});

// downvote callable function
exports.downvote = functions.https.onCall(async(data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Log in to vote'
    );
  }
  // get refs for user doc & request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const article = admin.firestore().collection('articles').doc(data.id);

  const doc = await user.get()
  // check thew user hasn't already upvoted
  if(doc.data().downvotedOn.includes(data.id)){
    throw new functions.https.HttpsError(
      'failed-precondition',
      'You can only vote something down once'
    );
  }

  if(doc.data().upvotedOn.includes(data.id)){
    await user.update({
      downvotedOn: admin.firestore.FieldValue.arrayUnion(data.id),
      upvotedOn:admin.firestore.FieldValue.arrayRemove(data.id),
    });
    // update the votes on the request
    return article.update({
      upvotes: admin.firestore.FieldValue.increment(-2)
    });
  }else{
    // update the array in user document
    await user.update({
      downvotedOn: admin.firestore.FieldValue.arrayUnion(data.id),
    });
    // update the votes on the request
    return article.update({
      upvotes: admin.firestore.FieldValue.increment(-1)
    });
  }
});

exports.addAdminRole = functions.https.onCall((data, context) => {
  // check auth state
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can vote on articles'
    );
  }
  //check request is made by an admin
  if (context.auth.token.admin !== true){
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only admins can add admins'
    );
  }

  // get user and add admin custom claim
  return admin.auth().getUserByEmail(data.email).then(user => {
    return admin.auth().setCustomUserClaims(user.uid, {
      admin: true
    })
  }).then(() => {
    return {
      message: `Success! ${data.email} has been made an admin.`
    }
  }).catch(err => {
    return err;
  });
});
