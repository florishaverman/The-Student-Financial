const db = firebase.firestore();
const functions= firebase.functions();

db.collection('articles').onSnapshot(snapshot => {
  //document.querySelector('.blog-list').innerHTML=''
  snapshot.docs.forEach(doc => renderBlog(doc));
  });


async function renderBlog(doc){
  //the list item to which everything should be added
  let li = document.createElement('li') ;
  li.classList.add('blog-post');

  let a = document.createElement('a');
  a.classList.add('blog-post-ref');
  a.setAttribute('href', 'article.html');

  //the title of the article
  let header = document.createElement('h3');
  header.classList.add('blog-post-header');
  header.textContent = doc.data().title;

  //the disctiption of the article
  let description = document.createElement('pre');
  description.classList.add('blog-post-description');
  description.textContent = doc.data().content;

  //read the full article
  let readFull = document.createElement('pre');
  readFull.classList.add('readfull');
  readFull.textContent = "Read full article";

  a.appendChild(header);
  a.appendChild(description);
  a.appendChild(readFull);
  li.appendChild(a);


  //create the ul under the blog
  let ul = document.createElement('ul');
  ul.classList.add('blog-post-details');
  ul.setAttribute('data-id', doc.id);

  //the author
  let author = document.createElement('li');
  author.classList.add('blog-post-element','blog-post-author');
  author.innerHTML = `<abbr title="Written by"><i class="fas fa-pen-nib article-icon"></i>${doc.data().author}</abbr>`;

  let publishedOn = document.createElement('li');
  publishedOn.classList.add('blog-post-element','blog-post-publish');
  publishedOn.innerHTML = `<abbr title="Publication date"><i class="far fa-clock article-icon"></i>${doc.data().publishedOn}</abbr>`;

  let readingtime = document.createElement('li');
  readingtime.classList.add('blog-post-element','blog-post-readingtime');
  readingtime.innerHTML = `<abbr title="Estimated reading time"><i class="fas fa-hourglass-end article-icon"></i>${doc.data().readingTime}&nbsp;minutes</abbr>`;

  let thumbsUp = document.createElement('li');
  thumbsUp.classList.add('blog-post-element','blog-post-thumbsup');
  thumbsUp.innerHTML = `<i class="fas fa-thumbs-up"></i>${doc.data().upvotes}`;

  let thumbsDown = document.createElement('li');
  thumbsDown.classList.add('blog-post-element','blog-post-thumbsdown');
  thumbsDown.innerHTML = `<i class="fas fa-thumbs-down"></i>`;

  ul.appendChild(author);
  ul.appendChild(publishedOn);
  ul.appendChild(readingtime);
  ul.appendChild(thumbsUp);
  ul.appendChild(thumbsDown);
  li.appendChild(ul);
  document.querySelector('#blog-list').appendChild(li)

  // upvoting the article
  thumbsUp.addEventListener('click', (e)=>{
    e.stopPropagation()
    let id =e.target.parentElement.getAttribute('data-id');
    const voteUp = functions.httpsCallable('upvote');
    voteUp({
      id:id
    })
    .catch(error => {
      console.log(error.message);
    });
  });

  // downvoting the article
  thumbsDown.addEventListener('click', (e)=>{
    e.stopPropagation()
    const voteDown = functions.httpsCallable('downvote');
    voteDown({
      id: e.target.parentElement.getAttribute('data-id')
    })
    .catch(error => {
      console.log(error.message);
    });
  });


  /*
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
  */
};
