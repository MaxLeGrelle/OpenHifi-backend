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

/*GET la liste des users*/
router.get('/', authorize, function(req, res, next) {
  return res.json(User.getList());
});

/**
 * Get la liste des musiques créée par un utilisateur
 */
router.get('/profil/:id', function(req,res,next) {
  const usersMusicList = Music.getListMusicFromIdCreator(req.params.id);
  console.log("GET /profil/:id", usersMusicList)
  return res.json(usersMusicList)
})

/* Post un nouvel utilisateur */ 
router.post('/register', function(req, res, next) {
  const newUser = new User(req.body.email, req.body.pseudo, req.body.password);
  newUser.save().then(() => {
    jwt.sign({email : req.body.email, id : newUser.id, pseudo : newUser.pseudo}, jwtKey, {expiresIn : TOKEN_LIFETIME}, (err,token) => {
      if (err) return res.status(500).send(err);
      return res.json({email : req.body.email, id : newUser.id, token})
    })
  }).catch((err) => res.status(500).send(err.message))
})

/**
 * Login un utilisateur
 */
router.post('/login', function(req, res, next) {
  User.checkLoginData(req.body.email, req.body.password).then((match) => {
    if (match) {
      const UserFound = User.getUserFromEmail(req.body.email);
      jwt.sign({email : req.body.email, id : UserFound.id, pseudo : UserFound.pseudo}, jwtKey, {expiresIn : TOKEN_LIFETIME}, (err,token) => {
        if (err) return res.status(500).send(err);
        return res.json({email : req.body.email, token})
      })
    }else return res.status(401).send("Mauvais email ou mot de passe")
  })
  
}) 

router.post('/profil/editPw', function(req, res, next){
   const NewPassword = req.body.newPassword;
   const OldPassword = req.body.oldPassword;
   const email  = req.body.email; 
   User.checkLoginData(email, OldPassword).then((match) =>{
     if(match){
       User.changePassword(email, NewPassword).then(() =>{
       return res.json({email : email, nouveauMdp : NewPassword}) 
       }).catch((err) => res.status(500).send(err.message))
     } else return res.status(401).send("Mauvais mot de passe")
   })

})

router.put('/profil/bio', function(req, res, next){
  const Bio = req.body.bio;
  const email = req.body.email;
  User.setBio(email, Bio).then(() =>{
    return res.json({email : email, bio : Bio}) 
    }).catch((err) => res.status(500).send(err.message))
})

/**
 * Get la liste des musiques likés par un utilisateur
 */
router.get('/favs/:id', function(req,res,next) {
  User.getUserFromId(req.params.id).then((userFound) => {
    if(userFound == null) return res.status(500).send("Probleme lors de la récupération de l'utilisateur depuis son id")
    return res.json({id : userFound.id, email : userFound.email, musicsLiked : userFound.musicsLiked})
  }).catch((err) => res.status(500).send(err.message))
})

module.exports = router;
