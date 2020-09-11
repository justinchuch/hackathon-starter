'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');
//const mongoose = require('mongoose');

//const userSchema = new mongoose.Schema({
//  email: { type: String, unique: true },
//  password: String,
//  passwordResetToken: String,
//  passwordResetExpires: Date,
//  emailVerificationToken: String,
//  emailVerified: Boolean,
//
//  snapchat: String,
//  facebook: String,
//  twitter: String,
//  google: String,
//  github: String,
//  instagram: String,
//  linkedin: String,
//  steam: String,
//  twitch: String,
//  quickbooks: String,
//  tokens: Array,
//
//  profile: {
//    name: String,
//    gender: String,
//    location: String,
//    website: String,
//    picture: String
//  }
//}, { timestamps: true });

class User {

  constructor(email, password) {
    this.email = email;
    this.password = password;
  }

  static findOne() {
    console.log('findOne');
    // GET
    // https://66d701da-d348-43fa-a484-b7eafdea7795-us-east1.apps.astra.datastax.com/api/rest/v2/namespaces/hackathon/collections/users/<username>
    // with header: X-Cassandra-Token
    return "user";
  }

  static findById() {
    console.log('findById');
    return "user";
  }

  static deleteOne() {
    // DELETE
    console.log('deleteOne');
  }

  save() {
    // PUT
    // https://66d701da-d348-43fa-a484-b7eafdea7795-us-east1.apps.astra.datastax.com/api/rest/v2/namespaces/hackathon/collections/users/<username>
    // with header: X-Cassandra-Token
    // with header: Content-Type : application/json
    console.log('save');

  }

//  pre('save', function save(next) {
//    console.log('pre');
//    const user = this;
//    if (!user.isModified('password')) { return next(); }
//    bcrypt.genSalt(10, (err, salt) => {
//      if (err) { return next(err); }
//      bcrypt.hash(user.password, salt, (err, hash) => {
//        if (err) { return next(err); }
//        user.password = hash;
//        next();
//      });
//    });
//  });

  static comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      cb(err, isMatch);
    });
  };

  static gravatar(size) {
    console.log('gravatar');

    if (!size) {
      size = 200;
    }
    if (!this.email) {
      return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email).digest('hex');
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
  }
}

/**
 * Password hash middleware.
 */
//userSchema.pre('save', function save(next) {
//  const user = this;
//  if (!user.isModified('password')) { return next(); }
//  bcrypt.genSalt(10, (err, salt) => {
//    if (err) { return next(err); }
//    bcrypt.hash(user.password, salt, (err, hash) => {
//      if (err) { return next(err); }
//      user.password = hash;
//      next();
//    });
//  });
//});

/**
 * Helper method for validating user's password.
 */
//userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
//  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
//    cb(err, isMatch);
//  });
//};

/**
 * Helper method for getting user's gravatar.
 */
//userSchema.methods.gravatar = function gravatar(size) {
//  if (!size) {
//    size = 200;
//  }
//  if (!this.email) {
//    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
//  }
//  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
//  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
//};

//const User = mongoose.model('User', userSchema);

module.exports = User;
