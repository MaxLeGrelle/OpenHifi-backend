"use strict"

const fs = require("fs");
const User = require("./User");
const FILE_PATH = __dirname + "/data/musics.json";
const FILE_PATH_MUSIC64 = __dirname + "/data/audios/";

class Music{

    constructor(title, pathMusic64, idCreator, duration, tag = "", id = Music.incId(), nbrLikes = 0){
        this.title = title;
        this.pathMusic64 = pathMusic64;
        this.idCreator = idCreator;
        this.tag = tag;
        this.id = id;
        this.nbrLikes = nbrLikes;
        this.duration = duration
    }

     /**
     * Ajoute de maniere asynchrone this à la liste des musiques et sauvegarde la liste modifiée
     */
    async save() {
        try{
            const musicList = getMusicsFromFile(FILE_PATH);
            musicList.push(this);
            saveMusicListToFile(FILE_PATH, musicList);
            return true;
        }catch(err) {return err}
    }

    static async saveMusic64(music64, titleMusic64) {
        try{
            const timestamp = Date.now();
            const path = FILE_PATH_MUSIC64+"/"+timestamp+"-"+titleMusic64+".txt";
            fs.writeFileSync(path, music64);
            return path;
        }catch(err) {return err}
    }

    static getMusic64(pathMusic64) {
        if (!fs.existsSync(pathMusic64)) return null;
        const music64 = fs.readFileSync(pathMusic64);
        if (!music64) return null;
        return music64.toString();
    }

    /**
     * Met à jour de maniére asynchrone le nombre de like d'une musique. Return false en cas d'erreur et true si le nombre de like a changé.
     * Si la musique correspondant à l'id de musicId a déjà été liké par l'utilisateur correspondant à l'id de userId alors la musique est dislike
     * sinon la musique est like
     * @param {*} musicId l'id de la musique à liker/disliker
     * @param {*} userId l'id the l'utilisateur ayant like ou dislike
     */
    static async updateLikes(musicId, userId) {
        try { 
            if (!musicId || !userId) return false;
            let musicsList = Music.getList();
            const musicFound = Music.getMusicFromId(musicId);
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
        }catch(err){return false}
    }

    /**
     * Retourne de maniére la musique correspond à l'id musicId. 
     * Retourne l'erreur rencontré si il y en a eu une.
     * @param {*} musicId l'id de la musique
     */
    static getMusicFromId(musicId) {
        const musicsList = Music.getList();
        return musicsList.find((music) => music.id == musicId)
        
    }

    /**
     * recupere la liste des musiques
     */
    static getList(){
        return getMusicsFromFile(FILE_PATH);
    }

    /**
     * Retourne la liste des id des musiques créée par l'utilisateur dont l'id est idCreator.
     * @param {*} idCreator l'id du créateur de la musique.
     */
    static getListMusicFromIdCreator(idCreator) {
        const musicList = Music.getList();
        return musicList.filter(music => {
            return music.idCreator == idCreator;
        })
    }

    /**
     * Permet d'incrémenter de maniére automatique l'id d'une nouvelle musique.
     */
    static incId() {
        const musicList = Music.getList();
        if (!musicList || musicList.length === 0) return 0;
        return musicList[musicList.length-1].id + 1;
    }

}

/**
 * écrit dans le fichier filePath pour sauvegarer la liste musicList
 * @param {*} path le chemin vers le fichier
 * @param {*} musicList la liste de musiques
 */
function saveMusicListToFile(path, musicList){
    const musicListToJson = JSON.stringify(musicList);
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