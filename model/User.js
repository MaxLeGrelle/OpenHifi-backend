"use strict"
const fs = require("fs")
const FILE_PATH = __dirname + "/data/users.json";



class User {
    constructor(email, pseudo, password) {
        this.email = email;
        this.pseudo = pseudo;
        this.password = password;
    }

    /**
     * Ajoute de maniere asynchrone this à la liste des users et sauvegarde la liste modifié
     */
    async save() {
        try {
            const userList = getUsersFromFile(FILE_PATH);
            userList.push(this);
            console.log("save userList updated : ", userList)
            saveUserListToFile(FILE_PATH, userList);
            return true;
        }catch(err) {return false}
    }

    /**
     * Return le User avec l'email email et le mot de passe password depuis la liste des users
     * @param {*} email l'email du user
     * @param {*} password le mot de passe du user
     */
    static checkLoginData(email, password) {
        if (!email || !password) return null;
        const userList = User.getList();
        console.log("getUser userList : ", userList)
        const userFound = userList.find((user) => { 
            return user.email === email && user.password === password
        })
        console.log("getUser userFound", userFound);
        return userFound;
    }

    /**
     * Récupere la liste des users du fichier users.json
     */
    static getList() {
        console.log("User getList")
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
    console.log("Write userList to file : ", userListToJson);
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
    console.log("Read user file raw data : " + rawData)
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = User;