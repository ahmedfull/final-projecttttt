const mongoose = require('mongoose');

const db = mongoose.connect('mongodb+srv://amhboom14:KqrqiZsaDRwtrg5A@cluster0.gjojykj.mongodb.net/')
  .then(() => {
    console.log("mongodb connected successfully 👍");
  })
  .catch((err) => {
    console.error("Connection error:", err);
  });

module.exports = db;