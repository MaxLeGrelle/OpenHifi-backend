"use strict"

const fs = require("fs");
const FILE_PATH = __dirname + "/data/musics.json";

class Music{

    constructor(title, filePath, creator, tag){
        this.title = title;
        this.filePath = filePath;
        this.creator = creator;
        this.tag = tag;
    }

     /**
     * Ajoute de maniere asynchrone this à la liste des musiques et sauvegarde la liste modifiée
     */
    async save() {
        try{
            const musicList = getMusicsFromFile(FILE_PATH);
            musicList.push(this);
            console.log("save musicList updated : ", musicList)
            saveMusicListToFile(FILE_PATH, musicList);
            return true;
        }catch(err) {return false}
    }

    /**
     * recupere la liste des musiques
     */
    static getList(){
        console.log("Music getList");
        return getMusicsFromFile(FILE_PATH);
    }

}

function saveMusicListToFile(path, musicList){
    const musicListToJson = JSON.stringify(musicList);
    console.log("Write musicList to file : ", musicListToJson);
    fs.writeFileSync(path, musicListToJson);
}

/**
 * Récupere la liste des musiques se trouvant dans filePath, 
 * return une liste vide si le fichier n'a pas été trouvé
 * @param {*} path le chemin vers le fichier
 */
function getMusicsFromFile(path){
    if (!fs.existsSync(path)) return [];
    const rawData = fs.readFileSync(path);
    console.log("Read user file raw data : " + rawData)
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = Music;