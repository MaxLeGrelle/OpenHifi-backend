var express = require('express');
var router = express.Router();
const User = require("../model/User.js")
const Music = require("../model/Music.js")
const jwt = require("jsonwebtoken");
const authorize = require('../utils/auths.js');
const jwtKey = "dsogi j-8 qsùfmlds!"
const TOKEN_LIFETIME = 24 * 60 * 60 * 1000 //24h

/* GET users listing NOTSAFE => TO DELETE */
router.get('/notsafe', function(req, res, next) {
  return res.json(User.getList());
});

/*GET users*/
router.get('/', authorize, function(req, res, next) {
  return res.json(User.getList());
});

router.get('/profil/:id', function(req,res,next) {
  const usersMusicList = Music.getListMusicFromIdCreator(req.params.id);
  console.log("GET /profil/:id", usersMusicList)
  return res.json(usersMusicList)
})

/* Register a new user */ 
router.post('/register', function(req, res, next) {
  const newUser = new User(req.body.email, req.body.pseudo, req.body.password);
  newUser.save().then(() => {
    jwt.sign({email : req.body.email, id : newUser.id}, jwtKey, {expiresIn : TOKEN_LIFETIME}, (err,token) => {
      if (err) return res.status(500).send(err);
      return res.json({email : req.body.email, id : newUser.id, token})
    })
  })
})

router.post('/login', function(req, res, next) {
  User.checkLoginData(req.body.email, req.body.password).then((match) => {
    if (match) {
      const UserFound = User.getUserFromEmail(req.body.email);
      jwt.sign({email : req.body.email, id : UserFound.id}, jwtKey, {expiresIn : TOKEN_LIFETIME}, (err,token) => {
        if (err) return res.status(500).send(err);
        return res.json({email : req.body.email, token})
      })
    }else return res.status(401).send("Mauvais email ou mot de passe")
  })
  
})

module.exports = router;
