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
  User.checkLoginData(req.body.email, req.body.password).then((match) => {
    if (match) return res.json({email : req.body.email});
    else return res.status(401).send("Mauvais email ou mot de passe")
  })
  
})

module.exports = router;
