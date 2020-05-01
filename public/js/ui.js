const db = firebase.firestore();
const functions= firebase.functions();
const loggedOutLinks = document.querySelectorAll('.logged-out');
const loggedInLinks = document.querySelectorAll('.logged-in');
const accountDetails  =document.querySelector('.account-details');

// setup NAVBAR
const setupUI = (user) => {
  const adminItems = document.querySelectorAll('.admin');
  if (user) {
    if (user.admin){

      adminItems.forEach(item => {
        item.style.display = 'block'
      });
    }

    // toggle user UI elements
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');

  } else {
    adminItems.forEach(item => item.style.display = 'none');

    //crear user info
    accountDetails.innerHTML='';

    // toggle user elements
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
};


//render guide
async function renderArticle(doc){
  let li = document.createElement('li') ;
  let header = document.createElement('div');
  let title = document.createElement('span');
  let content = document.createElement('div');
  let contentArticle = document.createElement('span');
  let right = document.createElement('span');
  let votes= document.createElement('span');

  //create the icons
  let upvote = createIcon('thumb_up_alt');
  let downvote = createIcon('thumb_down_alt');
  let cross = createIcon('delete',admin=true);
  let edit = createIcon('editing',admin=true);
  let update = createIcon('replay',admin=true);

  header.classList.add('collapsible-header','grey','lighten-4');
  content.classList.add('collapsible-body','white');
  edit.classList.add('modal-trigger');

  right.style.display= 'inherit';
  header.style.display= 'flex';
  header.style['justify-content'] = 'space-between';


  let comments = document.createElement('ul') ;
  db.collection('articles').doc(doc.id).collection('comments').onSnapshot(snapshot=>{
    comments.innerHTML = '';
    snapshot.docs.forEach(comment => {
      let toAdd = renderComment(comment);
      comments.appendChild(toAdd);
    }, function(error) {
      showNotification(error.message);
    });
  });

  // let comments = document.createElement('ul') ;
  // const docs = await db.collection('articles').doc(doc.id).collection('comments').get()
  // await docs.forEach(comment => {
  //   let toAdd = renderComment(comment);
  //   comments.appendChild(toAdd);
  // });
  //

  let form= renderForm()

  edit.setAttribute('data-target', 'modal-editArticle');
  right.setAttribute('data-id', doc.id);
  content.setAttribute('data-id', doc.id);
  title.textContent = doc.data().title;
  contentArticle.textContent = doc.data().content;
  votes.textContent = doc.data().upvotes;
  content.appendChild(contentArticle)
  content.appendChild(comments);
  content.appendChild(form);

  right.appendChild(downvote);
  right.appendChild(votes);
  right.appendChild(upvote);
  right.appendChild(cross);
  right.appendChild(edit);
  right.appendChild(update);
  header.appendChild(title);
  header.appendChild(right);
  li.appendChild(header);
  li.appendChild(content);


  document.querySelector('#guide-list').appendChild(li)



  // upvoting the article
  upvote.addEventListener('click', (e)=>{
    e.stopPropagation()
    const voteUp = functions.httpsCallable('upvote');
    voteUp({
      id: e.target.parentElement.getAttribute('data-id')
    })
    .catch(error => {
      showNotification(error.message);
    });
  });

  // downvoting the article
  downvote.addEventListener('click', (e)=>{
    e.stopPropagation()
    const voteDown = functions.httpsCallable('downvote');
    voteDown({
      id: e.target.parentElement.getAttribute('data-id')
    })
    .catch(error => {
      showNotification(error.message);
    });
  });

  // deleting the article
  cross.addEventListener('click', (e)=>{
    e.stopPropagation()
    const deleteArticle = functions.httpsCallable('deleteArticle');
    deleteArticle({
      id: e.target.parentElement.getAttribute('data-id')
    })
    .catch(error => {
      showNotification(error.message);
    });
  });

  //this is the button you need to press before editing the article
  //in order to load in the right content
  update.addEventListener('click', (e)=>{
    e.stopPropagation()
    const id = e.target.parentElement.getAttribute('data-id')
    document.querySelector('#editArticle-form').setAttribute('data-id', id)
    db.collection('articles').doc(id).get().then((doc)=>{
      const toUpdate = document.querySelector('#modal-editArticle #title');
      toUpdate.value=doc.data().title;
      const toUpdatetoo = document.querySelector('#modal-editArticle #content');
      toUpdatetoo.value=doc.data().content;
    })

  });

  //Posting a commment
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const addComment = functions.httpsCallable('addComment');
    const id = e.target.parentElement.getAttribute('data-id')
    addComment({
      articleId: id,
      content: form.comment.value,
      username: 'nog te doen'
    }).then(() => {
      // reset form
      form.reset();
      showNotification("comment posted")
    }).catch(err => {
      form.querySelector('.error').innerHTML = err.message;
    });
  });

};

function createIcon(value,admin=false){
  let icon = document.createElement('i');
  icon.classList.add('material-icons');
  if (admin){
    icon.classList.add('admin');
    icon.style.display = 'none';
  }
  icon.textContent = value;

  return icon;
}
function renderComment(doc){
    let li = document.createElement('li') ;
    let contentComment = document.createElement('div') ;

    contentComment.textContent = doc.data().content;

    li.appendChild(contentComment);

    return li
};
function renderForm(){
  let form = document.createElement('form')
  let inputfield= document.createElement('div')
  let button= document.createElement('button')
  let error= document.createElement('p')

  form.setAttribute("id", "addComment-form");
  inputfield.classList.add('input-field');
  button.classList.add('btn','yellow','darken-2','z-depth-0');
  error.classList.add('error','pink-text','center-align');

  button.textContent = 'Add comment';
  inputfield.innerHTML = `<input type="text" id="comment" required>
      <label for="comment">Write a comment</label>`
  form.appendChild(inputfield);
  form.appendChild(button);
  form.appendChild(error);

  return form
}


// create new article
const createForm = document.querySelector('#create-form');
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const addArticle = functions.httpsCallable('addArticle');
  addArticle({
    title: createForm.title.value,
    content: createForm.content.value,
    username: auth.currentUser.username,

  }).then(() => {
    // close the create modal & reset form
    const modal = document.querySelector('#modal-create');
    M.Modal.getInstance(modal).close();
    createForm.reset();
  }).catch(err => {
    createForm.querySelector('.error').innerHTML = err.message;
  });
});

// edit Article
const editArticleForm = document.querySelector('#editArticle-form');
editArticleForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const editArticle = functions.httpsCallable('editArticle');
  const author =  auth.currentUser.username;
  console.log(author)
  editArticle({
    title: editArticleForm.title.value,
    content: editArticleForm.content.value,
    username:author,
    id: editArticleForm.getAttribute('data-id')
  })
  .then(() => {
    // close the editArticle modal & reset form
    const modal = document.querySelector('#modal-editArticle');
    M.Modal.getInstance(modal).close();
    editArticleForm.reset();
  }).catch(err => {
    editArticleForm.querySelector('.error').innerHTML = err.message;
  });
});
