"use strict"
const fs = require("fs")
const bcrypt = require("bcrypt");
const FILE_PATH = __dirname + "/data/usersData.json";
const SALT_ROUNDS= 10;
const FILE_PATH_IMAGE64 = __dirname+"/data/images"
const escape = require("escape-html")

class User {
    constructor(email, pseudo, password, id = User.incId(), musicsLiked = [], albumsRecentlyListened = [], biographie = "", pathImage = "") {
        this.email = email;
        this.pseudo = escape(pseudo);
        this.password = password;
        this.id = id;
        this.musicsLiked = musicsLiked;
        this.albumsRecentlyListened = albumsRecentlyListened;
        this.biographie = escape(biographie);
        this.pathImage = pathImage;
    }

    /**
    * Add this asynchronously to the list of users and save the modified list
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

    /**
     * Update asynchronously the list of musics liked by the user with the id userId.
     * If the music with the id mucicId is already in his list of liked musics then it is deleted.
     * else it is added to his list
     * @param {*} musicId music's id
     * @param {*} userId user's id
     */
    static async updateMusicsLiked(musicId, userId) {
        try {
            if(!musicId || !userId) return false;
            let usersList = User.getList();
            const userFound = User.getUserFromId(userId);
            if (!userFound) return false;
            const index = usersList.findIndex((user) => user.id == userFound.id)
            if (index < 0) return false;
            const i = userFound.musicsLiked.indexOf(musicId)
            //unlike
            if (i >= 0) {
                userFound.musicsLiked.splice(i, 1);
            }else { //like
                userFound.musicsLiked.push(musicId)
            }
            usersList[index] = userFound;
            saveUserListToFile(FILE_PATH, usersList)
            return true;
        }catch (err){return false}
    }

    /**
     * Verifie de maniére asynchrone si la musique dont l'id vaut musicId se trouve déjà 
     * dans la liste des musiques liked de l'utilisateur dont l'id est userId. 
     * Si c'est le cas la fonction retourne true et false sinon.
     * Verify asynchronously if the music with the id musicId is already in the list of musics liked
     * of the user with the id userId. If it's the case, return true else false.
     * @param {*} userId user's id
     * @param {*} musicId music's id
     */
    static async isMusicLiked(userId, musicId) {
        const userFound = User.getUserFromId(userId);
        const musicFound = userFound.musicsLiked.find((musicLikedId) => {
            return musicLikedId == musicId;
        })
        if (musicFound == undefined) return false;
        return true;
    }

    /**
     * create a new file which contains the image in base64
     * @param {*} image64 image in base 64
     * @param {*} nomImage name of the image
     */
    static async saveImage64(image64, nomImage) {
        try{
            const timestamp = Date.now();
            const path = FILE_PATH_IMAGE64+"/"+timestamp+ "-" +nomImage + ".txt";
            fs.writeFileSync(path, image64);
            return path;
        }catch(err) {return err}
    }

    /**
     *  Retrieve the base 64 music
     * @param {*} pathImage64 path to the file
     */
    static getImage64(pathImage64){
        if (!pathImage64) return "";
        return fs.readFileSync(pathImage64).toString()
    }

    /**
     * Update the image of the user with the id idUser and save the new file
     * @param {*} idUser user's id
     * @param {*} path path of the new image
     */
    static async setImage(idUser, path){
        try{
            if(idUser == undefined || !path ) return false;
            const userFound = User.getUserFromId(idUser);
            let liste = User.getList();
            const index = liste.findIndex((user) =>{
                return user.id == userFound.id
            });
            userFound.pathImage = path;
            liste[index] = userFound;
            saveUserListToFile(FILE_PATH, liste);
            return true;
        }catch(err){return err}
    }

    /**
     * Retreive all the data related to the profil of the user with the id idUser
     * @param {*} idUser user's id
     */
    static getPublicInformations(idUser){
        const userFound = User.getUserFromId(idUser);
        return {pseudo : userFound.pseudo, bio: userFound.biographie, pathImage: userFound.pathImage}
    }

    /**
     * Return asynchronously a list of user which match with the one or more keywords
     * @param {*} keyWords list of key words
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
                Array.prototype.push.apply(found, result)
            }
            return found;
        }catch(err){return err}
    }

    /**
    * Automatically increment the id when a user is created
    */
    static incId() {
        const userList = User.getList();
        if (!userList || userList.length === 0) return 0;
        return userList[userList.length-1].id + 1;
    }

    /**
     * Verify asynchronously if the email and the password in paramater match
     * with an existing user. If it's the case, the method will verify both password.
     * Return true if the user exists and the password are the same, else return false
     * @param {*} email user's email
     * @param {*} password user's password
     */
    static async checkLoginData(email , password) {
        if (!email || !password) return false;
        const userToVerify = User.getUserFromEmail(email);
        if (!userToVerify) return false;
        try {
            return await bcrypt.compare(password, userToVerify.password)
        }catch(err){return false}
    }

    /**
     * Return the user with the email and password in parameter from the list of users
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

    /**
     * Return the user with the id id or return an error if the operation failed
     * @param {*} id user's id
     */
    static getUserFromId(id) {
        const userList = User.getList();
        const userFound = userList.find((user) => { 
            return user.id == id
        })
        return userFound;
    }

    /**
     * Retrieve the list of users from the json
     */
    static getList() {
        return getUsersFromFile(FILE_PATH);
    }

    /**
     * change the password with the newPassword
     * @param {*} newPassword new password
     */
    static async changePassword(userEmail, newPassword){
        try{
            if(!newPassword || !userEmail) return false;
            const userFound = User.getUserFromEmail(userEmail);
            let liste = User.getList();
            const index = liste.findIndex((user) => user.id == userFound.id);
            newPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)
            userFound.password = newPassword;
            liste[index] = userFound;
            saveUserListToFile(FILE_PATH, liste);
            return true;
        }catch(err){return err}
    }

    /**
     * Updata the bio
     * @param {*} id user's id
     * @param {*} bio user's new bio
     */
    static async setBio(id, bio){
        try{
            const userFound = User.getUserFromId(id);
            let liste = User.getList();
            const index = liste.findIndex((user) => user.id == userFound.id);
            userFound.biographie = escape(bio);
            liste[index] = userFound;
            saveUserListToFile(FILE_PATH, liste);
            return {id : id, bio : userFound.biographie};
        }catch(err){return err}
    }

    /**
     * Update the the list of recently listend albums of the user with id id
     * @param {*} id user's id
     * @param {*} recentlyListened new recently listened list
     */
    static async setRecentlyListened(id, recentlyListened) {
        try {
            if(id == undefined || !recentlyListened) return false;
            const userFound = User.getUserFromId(id)
            let users = User.getList();
            const index = users.findIndex((user) => user.id == id)
            userFound.albumsRecentlyListened = recentlyListened;
            users[index] = userFound;
            saveUserListToFile(FILE_PATH, users)
            return recentlyListened;
        }catch(err){return err}
    }


}

/**
 * Write in the file path to save the list userList
 * @param {*} filePath the path to the file
 * @param {*} userList the list of users
 */
function saveUserListToFile(filePath, userList){
    const userListToJson = JSON.stringify(userList);
    fs.writeFileSync(filePath, userListToJson);
}

/**
 * Return the list of users in path 
 * return an empty list if path does not exist
 * @param {*} path the path of the file
 */
function getUsersFromFile(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const rawData = fs.readFileSync(filePath);
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = User;