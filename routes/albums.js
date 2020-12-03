var express = require('express');
const Album = require('../model/Album.js');
var router = express.Router(); 

router.get("/", function (req, res, next) {
    const albumList = Album.getList();
    let image64list = new Array();
    albumList.forEach(album => {
        image64list.push(Album.getImage64(album.pathImage64));
    });
    return res.json({
        albumList : albumList,
        image64 : image64list
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