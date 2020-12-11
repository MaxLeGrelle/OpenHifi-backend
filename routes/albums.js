var express = require('express');
const Album = require('../model/Album.js');
const Music = require('../model/Music.js');
const User = require('../model/User.js');
var router = express.Router();

router.get("/", function (req, res, next) {
    const albumList = Album.getList();
    let creatorList = new Array();
    let image64List = new Array();
    albumList.forEach((album) => {
        image64List.push(Album.getImage64(album.pathImage64));
        const userFound = User.getUserFromId(album.idCreator);
        creatorList.push(userFound.pseudo);

    });
    return res.json({
        albumList: albumList,
        image64List: image64List,
        creatorList: creatorList
    });
})

router.post("/add", function (req, res, next) {
    let listIdMusics = new Array()
    req.body.listMusics.forEach((music) => {
        Music.saveMusic64(music.music64, music.title)
            .then((pathMusic64) => {
                const newMusic = new Music(music.title, pathMusic64, req.body.idCreator, music.duration)
                listIdMusics.push(newMusic.id)
                return newMusic.save()
            })
            .catch((err) => res.status(500).send(err.message))
    })
    Album.saveImage64(req.body.image64, req.body.imageName)
        .then((pathImage64) => {
            const newAlbum = new Album(req.body.name, listIdMusics, req.body.idCreator, pathImage64);
            newAlbum.save().then(() => {
                return res.json({
                    idAlbum: newAlbum.id,
                    listIdMusics: newAlbum.listIdMusics,
                    idCreator: newAlbum.idCreator,
                    image64Name: req.body.image64Name
                })
            }).catch((err) => res.status(500).send(err.message))
        })
        .catch((err) => res.status(500).send(err.message))
})

router.get("/:id", function (req, res, next) {
    const albumFound = Album.getAlbumFromId(req.params.id)
    if (albumFound == undefined) return res.status(404).send("Aucun album avec l'id " + req.params.id + " n'a été trouvé")
    let listMusicsInfo = new Array();
    let listMusics = new Array();
    let i = 0;

    albumFound.listIdMusics.forEach((musicId) => {
        const musicFound = Music.getMusicFromId(musicId)
        listMusicsInfo.push(musicFound)
        const music64Found = Music.getMusic64(listMusicsInfo[i].pathMusic64)
        listMusics.push(music64Found)
        i++;
    })
    const creator = User.getUserFromId(albumFound.idCreator)
    const image64 = Album.getImage64(albumFound.pathImage64)
    return res.json({
        id: albumFound.id,
        name: albumFound.name,
        listMusicsInfo: listMusicsInfo,
        listMusics64: listMusics,
        creator: creator.pseudo,
        image64: image64,
        nbrLikes: albumFound.nbrLikes
    })
})

module.exports = router;