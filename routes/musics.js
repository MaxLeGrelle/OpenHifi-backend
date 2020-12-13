var express = require('express');
var router = express.Router();
const Music = require("../model/Music.js");
const User = require('../model/User.js');

/**
 * Get la liste des musiques
 */
router.get('/', function(req,res,next){
  return res.json(Music.getList());  
})

/**
 * Post une nouvelle musique
 */
router.post('/add', function(req, res, next){
    const newMusic = new Music(req.body.title, req.body.filePath, req.body.idCreator, req.body.duration, req.body.tag);
    newMusic.save().then((saved)=> {
        if(saved) {
            return res.json({
                title : req.body.title,
                filePath : req.body.filePath,
                idCreator : req.body.idCreator 
            })
        }
    }).catch((err) => res.status(500).send(err.message))
})

/**
 * Update le nombre de like d'une musique et la liste des musiques liked d'un utilisateur
 */
router.put('/fav/:userId/:musicId', function(req, res, next) {
    Music.updateLikes(req.params.musicId, req.params.userId).then((worked) => {
        if (worked) {
            return User.updateMusicsLiked(req.params.musicId, req.params.userId).then((worked) => {
                if (worked) {
                    return res.json({userIdWhoLikedOrDisliked : req.params.userId, musicIdLikedOrDisliked : req.params.musicId})
                }else {
                    res.status(500).send("Probleme lors de l'ajout/suppression de la musique dans les musiques likées de l'utilisateur")
                }
            })
        }else {
            res.status(500).send("Probleme lors de l'incrémentation/décrémentation du nombre de like de la musique")
        }
        
    })
})

/**
 * Get le nombre de like d'une musique
 */
router.get('/fav/:id', function (req,res,next) {
    Music.getMusicFromId(req.params.id).then((musicFound) => {
        return res.json({id : musicFound.id, title : musicFound.title, likes : musicFound.nbrLikes});
    }).catch((err) => res.status(500).send(err.message))

})

/**
 * Get une musique
 */
router.get("/:idUser", function (req, res, next) {
   let user = User.getUserFromId(req.params.idUser)
   let listeMusic = []
   user.musicsLiked.forEach(id =>{
    music = Music.getMusicFromId(id)
    let creator = User.getUserFromId(music.idCreator)
    listeMusic.push({music : music, creator: creator.pseudo})
   })
   return res.json(listeMusic)
})

module.exports = router;