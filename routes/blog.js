const express = require('express');
const mongodb = require('mongodb');
const db = require('../data/database');
const ObjectId = mongodb.ObjectId;


const router = express.Router();

router.get('/', function (req, res) {
  res.redirect('/posts');
});

router.get('/posts', async function (req, res) {
  const posts = await db
    .getDb()
    .collection('posts')
    .find({}, { title: 1, "author.name": 1, summary: 1 })
    .toArray();
  res.render('posts-list', { posts: posts });
});

router.get('/new-post', async function (req, res) {
  const authors = await db
    .getDb()
    .collection('authors')
    .find()
    .toArray();
  res.render('create-post', { authors: authors });
});

router.post('/posts', async function (req, res) {
  const authorId = new ObjectId(req.body.author);
  const author = await db
    .getDb()
    .collection('authors')
    .findOne({ _id: authorId });
  const newpost = {
    title: req.body.title,
    summary: req.body.summary,
    content: req.body.content,
    date: new Date(),
    author: {
      id: author._id,
      name: author.name,
      email: author.email
    }
  }
  const result = await db
    .getDb()
    .collection('posts')
    .insertOne(newpost);
  console.log(result);
});

router.get('/posts/:id', async function (req, res) {
  const idObjectPost = new ObjectId(req.params.id);
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: idObjectPost }, { summary: 0 });

  if (!post) {
    return res.status(404).send('404');
  }
  post.hummanReadableDate = post.date.toLocaleDateString('en-US', {
    weekay: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  post.date = post.date.toISOString();
  res.render('post-detail', { post: post })

});

router.get('/update-post/:id', async function (req, res) {
  const idObject = new ObjectId(req.params.id);
  const post = await db
    .getDb()
    .collection('posts')
    .findOne({ _id: idObject }, { title: 1, summary: 1, content: 1 });
  res.render('update-post', { post: post });
  console.log(post);
});
router.post('/update-post/:id', async function (req, res) {
  const idpost = new ObjectId(req.params.id);
  console.log(idpost);
  // const post = await db.getDb().collection("posts").findOne({ _id: idpost });
  const newpost = {
    $set: {
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content
    }
  }
  const result = await db
  .getDb()
  .collection("posts")
  .updateOne({ _id: idpost }, newpost);
  console.log(result);
  res.redirect("/posts");
});
router.get('/posts/delete-post/:id', async function (req, res){
  const result = await db
  .getDb()
  .collection("posts")
  .deleteOne({ _id: new ObjectId(req.params.id)});
  console.log(result);
  res.redirect('/posts');
})
module.exports = router;