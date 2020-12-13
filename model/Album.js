"use strict"
const fs = require("fs");
const FILE_PATH = __dirname + "/data/albumsData.json";
const FILE_PATH_IMAGE64 = __dirname + "/data/images";
const FILE_PATH_IMAGE64_DEFAULT = __dirname + "/data/imageDefault/imageDefault.txt";
const escape = require("escape-html")

class Album {
    constructor(name, listIdMusics, idCreator, pathImage64, nbrLikes = 0, id = Album.incId()) {
        this.name = escape(name);
        this.listIdMusics = listIdMusics;
        this.idCreator = idCreator;
        this.pathImage64 = pathImage64;
        this.nbrLikes = nbrLikes;
        this.id = id;
    }

    /**
     * add this to the album list and save the modifed list
     */
    save() {
        const albumsList = getAlbumsFromFile(FILE_PATH)
        albumsList.push(this);
        saveAlbumListToFile(FILE_PATH, albumsList);
        return true;
    }

    /**
     * Retrieve the id albumId from the json
     * @param {*} albumId album's id
     */
    static getAlbumFromId(albumId) {
        const albumsList = Album.getList()
        const album = albumsList.find(album => album.id == albumId);
        return album;
    }

    /**
     * create a new file which contains the image in base64
     * @param {*} image64 image in base 64
     * @param {*} nameImage64 name of the image
     */
    static saveImage64(image64, nameImage64) {
        let path
        if (!image64) {
            path = FILE_PATH_IMAGE64_DEFAULT
        }else {
            const timestamp = Date.now();
            path = FILE_PATH_IMAGE64 + "/" + timestamp + "-" + nameImage64 + ".txt";
            fs.writeFileSync(path, image64);
        }
        return path;
    }

    /**
     * Automatically increment the id when an album is created
     */
    static incId() {
        const albumsList = Album.getList();
        if (!albumsList || albumsList.length === 0) return 0;
        return albumsList[albumsList.length - 1].id + 1;
    }

    /**
     * Retrieve the album's list 
     */
    static getList() {
        return getAlbumsFromFile(FILE_PATH);
    }


    /**
     * Retrieve the base 64 image
     * @param {*} pathImage64 path to the file
     */
    static getImage64(pathImage64) {
        if (!fs.existsSync(pathImage64)) return null;
        const image64 = fs.readFileSync(pathImage64);
        if (!image64) return null;
        return image64.toString();
    }

}



/**
 * Write in the file path to save the list albumList
 * @param {*} path the path to the file
 * @param {*} albumList the list of albums
 */
function saveAlbumListToFile(path, albumList) {
    const albumListToJson = JSON.stringify(albumList);
    fs.writeFileSync(path, albumListToJson);
}

/**
 * Return the list of albums in path 
 * return an empty list if path does not exist
 * @param {*} path the path of the file
 */
function getAlbumsFromFile(path) {
    if (!fs.existsSync(path)) return [];
    const rawData = fs.readFileSync(path);
    if (!rawData) return [];
    return JSON.parse(rawData);
}

module.exports = Album;