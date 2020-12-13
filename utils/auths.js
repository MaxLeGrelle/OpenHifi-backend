const jwt = require("jsonwebtoken");
const jwtKey = "dsogi j-8 qsùfmlds!"
const User = require("../model/User.js")

function authorize(req, res, next) {
    let token = req.get("authorization")
    if (!token) return res.status(401).send("Vous n'êtes pas connecté")
    jwt.verify(token, jwtKey, function (err, token) {
        if (err) return res.status(401).send(err.message)
        const users = User.getList()
        const userFound = users.find((user) => user.email === token.email);
        if (!userFound) return res.status(403).send("Accés refusé")
        next();
    })
}

module.exports = authorize;