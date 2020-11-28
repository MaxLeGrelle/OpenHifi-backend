"use strict"

const fs = require("fs");
const User = require("./User");
const FILE_PATH = __dirname + "/data/musics.json";

class Music{

    constructor(title, filePath, idCreator, tag, id = Music.incId(), nbrLikes = 0){
        this.title = title;
        this.filePath = filePath;
        this.idCreator = idCreator;
        this.tag = tag;
        this.id = id;
        this.nbrLikes = nbrLikes;
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

    static async updateLikes(musicId, userId) {
        try { 
            if (!musicId || !userId) return false;
            let musicsList = Music.getList();
            const musicFound = await Music.getMusicFromId(musicId);
            if (!musicFound) return false;
            const index = musicsList.findIndex((music) => music.id == musicFound.id)
            if (index < 0) return false;
            //unlike
            if (await User.isMusicLiked(userId, musicId)) {
                if(musicFound.nbrLikes == 0) return false;
                musicFound.nbrLikes--;
            }else { //like
                musicFound.nbrLikes++;
            }
            musicsList[index] = musicFound;
            saveMusicListToFile(FILE_PATH, musicsList)
            return true;
        }catch(err){
            console.log("ERREUR", err)
            return false
        }
    }

    static async getMusicFromId(musicId) {
        try {
            const musicsList = Music.getList();
            return musicsList.find((music) => music.id == musicId)
        }catch(err){return false}
        
    }

    /**
     * recupere la liste des musiques
     */
    static getList(){
        console.log("Music getList");
        return getMusicsFromFile(FILE_PATH);
    }

    static getListMusicFromIdCreator(idCreator) {
        const musicList = Music.getList();
        return musicList.filter(music => {
            return music.idCreator == idCreator;
        })
    }

    static incId() {
        const musicList = Music.getList();
        if (!musicList || musicList.length === 0) return 0;
        return musicList[musicList.length-1].id + 1;
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
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = Music;