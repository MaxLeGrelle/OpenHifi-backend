var express = require('express');
var router = express.Router();
const User = require("../model/User.js")
const Music = require("../model/Music.js")
const jwt = require("jsonwebtoken");
const authorize = require('../utils/auths.js');
const Album = require('../model/Album.js');
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
  let user = User.getPublicInformations(req.params.id);
  user.pathImage = User.getImage64(user.pathImage)
  return res.json({musicList :usersMusicList, userInfo: user})
})

/* Post un nouvel utilisateur */ 
router.post('/register', function(req, res, next) {
  const newUser = new User(req.body.email, req.body.pseudo, req.body.password);
  newUser.save().then(() => {
    jwt.sign({email : req.body.email, id : newUser.id, pseudo : newUser.pseudo}, jwtKey, {expiresIn : TOKEN_LIFETIME}, (err,token) => {
      if (err) return res.status(500).send(err);
      return res.json({email : req.body.email, pseudo : newUser.pseudo, id : newUser.id, token})
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
        return res.json({email : req.body.email,pseudo : UserFound.pseudo, musicsLiked : UserFound.musicsLiked, recentlyListened : UserFound.albumsRecentlyListened,token : token})
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
  const Id = req.body.id;
  User.setBio(Id, Bio).then((toReturn) =>{
    return res.json(toReturn)
    }).catch((err) => res.status(500).send(err.message))
})

router.put('/profil/setImage/', function(req, res, next){
  const Image64 = req.body.image64;
  const Id = req.body.id;
  const NameImage = req.body.nameImage;
  User.saveImage64(Image64, NameImage).then((path) => {
    User.setImage(Id, path).then((reponse) =>{
      if(reponse) return res.json({id : Id, image64 : Image64})
      else throw new Error("l'image ne s'est pas mise a jour");
    })
  }).catch((err) => res.status(500).send(err.message))
})

/**
 * Get la liste des musiques likés par un utilisateur
 */
router.get('/favs/:id', function(req,res,next) {
  const userFound = User.getUserFromId(req.params.id)
  if(userFound == null) return res.status(404).send("Aucun utilisateur avec l'id", req.params.id, "n'a été trouvé")
  return res.json({id : userFound.id, email : userFound.email, musicsLiked : userFound.musicsLiked})
})

router.put('/recently/:id', function(req, res ,next) {
  User.setRecentlyListened(req.params.id, req.body.recentlyListened).then((recentlyListened) => {
    if (!recentlyListened) return res.status(500).send("Erreur lors de la mise à jour de la liste des albums ecoutés récemment")
    return res.json({id : req.params.id, recentlyListened : recentlyListened})
  }).catch((err) => res.status(500).send("Erreur : "+err))
})

router.get("/recently/:id", function (req, res, next) {
  const userFound = User.getUserFromId(req.params.id)
  if (!userFound) return res.status(404).send("Aucun utilisateur avec l'id " + req.params.id + " n'a été trouvé")
  let albumRecentlyListened = new Array();
  let creatorList = new Array();
  let image64List = new Array();
  userFound.albumsRecentlyListened.forEach((id) => {
      const album = Album.getAlbumFromId(id);
      const creator = User.getUserFromId(album.idCreator)
      const image64 = Album.getImage64(album.pathImage64)
      albumRecentlyListened.push(album)
      creatorList.push(creator.pseudo)
      image64List.push(image64)
  })
  return res.json({
      albumRecentlyListened: albumRecentlyListened,
      creatorList : creatorList,
      image64List: image64List
  })
})

router.get("/image/:id", function(req, res, next) {
  const userFound = User.getUserFromId(req.params.id)
  if (!userFound) res.status(404).send("Aucun utilisateur avec l'id " + req.params.id + " n'a été trouvé")
  const image64 = User.getImage64(userFound.pathImage)
  return res.json({image64 : image64})
})

module.exports = router;
