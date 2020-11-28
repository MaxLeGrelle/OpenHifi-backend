var express = require('express');
var router = express.Router();
const Music = require("../model/Music.js");
const User = require('../model/User.js');

router.get('/', function(req,res,next){
  return res.json(Music.getList());  
})

router.post('/add', function(req, res, next){
    const newMusic = new Music(req.body.title, req.body.filePath, req.body.idCreator, req.body.tag);
    newMusic.save().then(()=> {
        return res.json({
            title : req.body.title,
            filePath : req.body.filePath,
            idCreator : req.body.idCreator 
        })
    })
})

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

module.exports = router;