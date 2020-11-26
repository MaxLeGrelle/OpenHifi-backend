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
  newUser.save().then(() => {
    return res.json(newUser);
  })
})

router.post('/login', function(req, res, next) {
  const userToFind = User.checkLoginData(req.body.email, req.body.password)
  if (!userToFind) return res.status(403).send("Mauvais email ou mot de passe")
  return res.json(userToFind);
})

module.exports = router;
