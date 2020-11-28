"use strict"
const fs = require("fs")
const bcrypt = require("bcrypt");
const FILE_PATH = __dirname + "/data/users.json";
const SALT_ROUNDS= 10;


class User {
    constructor(email, pseudo, password, id = User.incId(), musicsLiked = []) {
        this.email = email;
        this.pseudo = pseudo;
        this.password = password;
        this.id = id;
        this.musicsLiked = musicsLiked;
    }

    /**
     * Ajoute de maniere asynchrone this à la liste des users et sauvegarde la liste modifié
     */
    async save() {
        try {
            const userList = getUsersFromFile(FILE_PATH);
            this.password = await bcrypt.hash(this.password, SALT_ROUNDS)
            userList.push(this);
            saveUserListToFile(FILE_PATH, userList);
            return true;
        }catch(err) {return false}
    }

    static async updateMusicsLiked(musicId, userId) {
        try {
            if(!musicId || !userId) return false;
            let usersList = User.getList();
            const userFound = User.getUserFromId(userId);
            if (!userFound) return false;
            const index = usersList.findIndex((user) => user.id == userFound.id)
            if (index < 0) return false;
            const i = userFound.musicsLiked.indexOf(musicId)
            console.log("updateMusicsLiked :: i =", i)
            //unlike
            if (i >= 0) {
                userFound.musicsLiked.splice(i, 1);
            }else { //like
                userFound.musicsLiked.push(musicId)
            }
            usersList[index] = userFound;
            saveUserListToFile(FILE_PATH, usersList)
            return true;
        }catch (err){
            console.log("ERREUR", err)
            return false
        }
        
    }

    static isMusicLiked(userId, musicId) {
        const userFound = User.getUserFromId(userId);
        return userFound.musicsLiked.find((musicLikedId) => {
                return musicLikedId == musicId;
        })
    }

    /**
     * Retourne une liste d'utilisateur correspondant à un ou plusieurs mot clé se trouvant dans keyWords
     * @param {*} keyWords liste de mot(s) clé(s)
     */
    static async searchUsers(keyWords) {
        try {
            const userList = User.getList();
            let result = [];
            let found = [];
            for (let i = 0; i < keyWords.length; i++) {
                result = userList.filter((user) => {
                    return user.pseudo.toLowerCase().includes(keyWords[i].toLowerCase())
                })
                Array.prototype.push.apply(found, result) //fusionne 2 tabs
            }
            return found;
        }catch(err){return null}
    }

    static incId() {
        const userList = User.getList();
        if (!userList || userList.length === 0) return 0;
        return userList[userList.length-1].id + 1;
    }

    static async checkLoginData(email , password) {
        if (!email || !password) return false;
        console.log(password)
        const userToVerify = User.getUserFromEmail(email);
        if (!userToVerify) return false;
        try {
            return await bcrypt.compare(password, userToVerify.password)
        }catch(err){return false}
    }

    /**
     * Return le User avec l'email email et le mot de passe password depuis la liste des users
     * @param {*} email l'email du user
     * @param {*} password le mot de passe du user
     */
    static getUserFromEmail(email) {
        if (!email) return null;
        const userList = User.getList();
        const userFound = userList.find((user) => { 
            return user.email === email
        })
        return userFound;
    }

    static getUserFromId(id) {
        if (!id) return null;
        const userList = User.getList();
        const userFound = userList.find((user) => { 
            return user.id == id
        })
        return userFound;
    }

    /**
     * Récupere la liste des users du fichier users.json
     */
    static getList() {
        return getUsersFromFile(FILE_PATH);
    }


}

/**
 * écrit dans le fichier filePath pour sauvegarer la liste userList
 * @param {*} filePath chemin vers le fichier json
 * @param {*} userList liste de User
 */
function saveUserListToFile(filePath, userList){
    const userListToJson = JSON.stringify(userList);
    fs.writeFileSync(filePath, userListToJson);
}

/**
 * Récupere la liste des users se trouvant dans filePath, 
 * return une liste vide si le fichier n'a pas été trouvé
 * @param {*} filePath le chemin vers le fichier
 */
function getUsersFromFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const rawData = fs.readFileSync(filePath);
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = User;