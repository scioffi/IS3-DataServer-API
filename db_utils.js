const mysql = require("mysql");
const settings = require("./mysql_conf.json");
let db;

module.exports = {
    connectDatabase: () => {
        if (!db) {
            db = mysql.createPool(settings);

            db.getConnection(function(err){
                if(err){
                    console.error(err);
                }
            });
        }
        return db;
    }
};