var express = require('express');
var router = express.Router();
const Music = require("../model/Music.js");

router.get('/', function(req,res,next){
  return res.json(Music.getList());  
})

router.post('/add', function(req, res, next){
    const newMusic = new Music(req.body.title, req.body.filePath, req.body.creator, req.body.tag);
    newMusic.save().then(()=> {
        return res.json({
            title : req.body.title,
            filePath : req.body.filePath,
            creator : req.body.creator 
        })
    })
})

module.exports = router;