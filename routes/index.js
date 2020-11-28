var express = require('express');
const User = require('../model/User');
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
  
// });

router.get('/research/:keyWords', function(req, res, next) {
  console.log("GET / : key words params :",req.params.keyWords);
  const keyWords = req.params.keyWords.split(" ");
  User.searchUsers(keyWords).then((usersFound) => {
    return res.json(usersFound)
  }).catch((err) => res.status(500).send(err.message))
  
})

module.exports = router;
