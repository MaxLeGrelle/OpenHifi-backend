var express = require('express');
const Album = require('../model/Album.js');
const User = require('../model/User.js');
var router = express.Router(); 

router.get("/", function (req, res, next) {
    const albumList = Album.getList();
    let creatorList = new Array();
    let image64List = new Array();
    albumList.forEach((album)=> {
        image64List.push(Album.getImage64(album.pathImage64));
        const userFound = User.getUserFromId(album.idCreator);
        if (userFound == null) creatorList.push("anonyme")
        else creatorList.push(userFound.pseudo);
        
    });
    return res.json({
        albumList : albumList,
        image64List : image64List,
        creatorList : creatorList
    });  
})

router.post("/add", function (req, res, next) {
    Album.saveImage64(req.body.image64, req.body.imageName).then((pathImage64) => {
        const newAlbum = new Album(req.body.name, req.body.listIdMusics, req.body.idCreator, pathImage64);
        newAlbum.save().then(() => {
            return res.json({
                idAlbum : newAlbum.id,
                listMusics : newAlbum.listIdMusics,
                idCreator : newAlbum.idCreator,
                image64Name : req.body.image64Name
            })
        }).catch((err) => res.status(500).send(err.message))
    }).catch((err) => res.status(500).send(err.message))
})

module.exports = router;