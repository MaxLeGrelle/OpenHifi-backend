"use strict"
const fs = require("fs")
const FILE_PATH = __dirname + "/data/users.json";



class User {
    constructor(email, pseudo, password) {
        this.email = email;
        this.pseudo = pseudo;
        this.password = password;
    }

    save() {
        const userList = getUsersFromFile(FILE_PATH);
        userList.push(this);
        console.log("save userList updated : ", userList)
        saveUserListToFile(FILE_PATH, userList);
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
 * Récupére la liste des users se trouvant dans filePath, 
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