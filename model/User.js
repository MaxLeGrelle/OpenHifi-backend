"use strict"
const fs = require("fs")
const bcrypt = require("bcrypt");
const { getList } = require("./Music");
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
    

    /**
     * Met à jour de maniére asynchrone la liste des musiques liked par l'utilisateur dont l'id est userId.
     * Si la musique dont l'id est musicId se trouve déjà dans sa liste des musiques liked alors elle supprimé de sa liste
     * sinon elle est ajouté à sa liste
     * @param {*} musicId L'id de la musique à ajouter
     * @param {*} userId L'id de l'utilisateur qui a liked/disliked
     */
    static async updateMusicsLiked(musicId, userId) {
        try {
            if(!musicId || !userId) return false;
            let usersList = User.getList();
            const userFound = await User.getUserFromId(userId);
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
     * @param {*} userId l'id de l'utilisateur
     * @param {*} musicId l'id de la musique
     */
    static async isMusicLiked(userId, musicId) {
        const userFound = await User.getUserFromId(userId);
        const musicFound = userFound.musicsLiked.find((musicLikedId) => {
            return musicLikedId == musicId;
        })
        if (musicFound == undefined) return false;
        return true;
    }

    /**
     * Retourne de maniére asynchrone une liste d'utilisateur correspondant à un ou plusieurs mot clé se trouvant dans keyWords
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
        }catch(err){return err}
    }

    /**
     * Permet d'incrémenter de maniére automatique l'id d'un nouvel utilisateur.
     */
    static incId() {
        const userList = User.getList();
        if (!userList || userList.length === 0) return 0;
        return userList[userList.length-1].id + 1;
    }

    /**
     * Vérifie de maniére asynchrone si l'email et le password entré en paramétre corréspondant
     * à un utilisateur existant, et si c'est le cas vérifie les deux mots de passes.
     * Retourne true si l'utilisateur existe et que password est le même que le password crypté
     * et false sinon.
     * @param {*} email l'email de l'utilisateur 
     * @param {*} password le mot de passe de l'utilisateur
     */
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
     * Return null si l'email en paramétre n'est pas valide
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
     * Retourne de maniére asynchrone l'utilisateur correspond à l'id donné en paramétre.
     * Retourne null si l'id en paramétre n'est pas valide
     * Retourne une erreur si l'opération a echoué
     * @param {*} id l'id de l'utilisateur à renvoyer
     */
    static async getUserFromId(id) {
        try {
            if (!id) return null;
            const userList = User.getList();
            const userFound = userList.find((user) => { 
                return user.id == id
            })
            return userFound;
        }catch(err){return err}
        
    }

    /**
     * Récupere la liste des users du fichier users.json
     */
    static getList() {
        return getUsersFromFile(FILE_PATH);
    }

    /**
     * change le mot de passe d'un utilisateur
     * @param {*} newPassword 
     *
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