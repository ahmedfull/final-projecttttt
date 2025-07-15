const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CatogarySchema = new Schema({
    Catogaryname: {
    type: String,
    required: true,
  },
});

module.exports = CatogarySchema