var express = require('express');
var router = express.Router();
const User = require("../model/User.js")

/* GET users listing. */
router.get('/', function(req, res, next) {
  return res.json(User.getList());
});

/* Register a new user */ 
router.post('/register', function(req, res, next) {
  const newUser = new User(req.body.email, req.body.pseudo, req.body.password);
  newUser.save();
  return res.json(newUser);
})

module.exports = router;
