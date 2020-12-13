var express = require('express');
const User = require('../model/User');
var router = express.Router();

/**
 * GET research result
 */
router.get('/research/:keyWords', function(req, res, next) {
  const keyWords = req.params.keyWords.split(" ");
  User.searchUsers(keyWords).then((usersFound) => {
    return res.json(usersFound)
  }).catch((err) => res.status(500).send(err.message))
})

module.exports = router;
