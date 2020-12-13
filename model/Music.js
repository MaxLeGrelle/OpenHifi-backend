"use strict"
const fs = require("fs");
const User = require("./User");
const FILE_PATH = __dirname + "/data/musicsData.json";
const FILE_PATH_MUSIC64 = __dirname + "/data/audios/";
const escape = require("escape-html")

class Music {
    constructor(title, pathMusic64, idCreator, duration, pathImage64, album,idAlbum, tag = "", id = Music.incId(), nbrLikes = 0) {
        this.title = escape(title);
        this.pathMusic64 = pathMusic64;
        this.idCreator = idCreator;
        this.tag = tag;
        this.id = id;
        this.nbrLikes = nbrLikes;
        this.duration = duration;
        this.pathImage64 = pathImage64;
        this.album = escape(album);
        this.idAlbum = idAlbum;
    }

    /**
    * Add this to the list of musics and save the modified list
    */
    save() {
        const musicList = getMusicsFromFile(FILE_PATH);
        musicList.push(this);
        saveMusicListToFile(FILE_PATH, musicList);
        return true;
    }

    /**
     * create a new file which contains the muisc in base64
     * @param {*} music64 music in base 64
     * @param {*} titleMusic64 title of the music
     */
    static saveMusic64(music64, titleMusic64) {
        let title = titleMusic64.replace("/","-") //replace '/' because writeFileSync will throw "no such file or directory"
        const timestamp = Date.now();
        const path = FILE_PATH_MUSIC64 + "/" + timestamp + "-" + title + ".txt";
        fs.writeFileSync(path, music64);
        return path;
    }

    /**
     * Retrieve the base 64 music
     * @param {*} pathMusic64 path to the file
     */
    static getMusic64(pathMusic64) {
        if (!fs.existsSync(pathMusic64)) return null;
        const music64 = fs.readFileSync(pathMusic64);
        if (!music64) return null;
        return music64.toString();
    }

    /**
     * Update asynchronously the number of likes of a music's id. 
     * Return false if there's an error and true if the number of likes has been changed.
     * If the music's id has already been liked by the user, then the music will be disliked else, the music is liked
     * @param {*} musicId the music's id
     * @param {*} userId the user's id
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
                if (musicFound.nbrLikes == 0) return false;
                musicFound.nbrLikes--;
            } else { //like
                musicFound.nbrLikes++;
            }
            musicsList[index] = musicFound;
            saveMusicListToFile(FILE_PATH, musicsList)
            return true;
        } catch (err) { return false }
    }

    /**
     * Return the music related to the music id musicId
     * Return the error met of there's one
     * @param {*} musicId music's id
     */
    static getMusicFromId(musicId) {
        const musicsList = Music.getList();
        return musicsList.find((music) => music.id == musicId)
    }

    /**
     * Retrieve the list of musics from the json
     */
    static getList() {
        return getMusicsFromFile(FILE_PATH);
    }

    /**
     * Return the list of music's id created by the user with the id idCreator
     * @param {*} idCreator creator's id
     */
    static getListMusicFromIdCreator(idCreator) {
        const musicList = Music.getList();
        return musicList.filter(music => {
            return music.idCreator == idCreator;
        })
    }

    /**
     * Automatically increment the id when a music is created
     */
    static incId() {
        const musicList = Music.getList();
        if (!musicList || musicList.length === 0) return 0;
        return musicList[musicList.length - 1].id + 1;
    }
}

/**
 * Write in the file path to save the list musicList
 * @param {*} path the path to the file
 * @param {*} musicList the list of musics
 */
function saveMusicListToFile(path, musicList) {
    const musicListToJson = JSON.stringify(musicList);
    fs.writeFileSync(path, musicListToJson);
}

/**
 * Return the list of musics in path 
 * return an empty list if path does not exist
 * @param {*} path the path of the file
 */
function getMusicsFromFile(path) {
    if (!fs.existsSync(path)) return [];
    const rawData = fs.readFileSync(path);
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = Music;
