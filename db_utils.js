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
    },

    getStats: (table, field, db, callback) => {
        const stats = {};

        db.query(`SELECT MIN(${field}) FROM ${table}`, (error1, result_min) => {
            stats.min = result_min[0][`MIN(${field})`];

            db.query(`SELECT MAX(${field}) FROM ${table}`, (error2, result_max) => {
                stats.max =result_max[0][`MAX(${field})`];

                db.query(`SELECT AVG(${field}) from ${table}`, (error3, result_avg) => {
                    stats.average = result_avg[0][`AVG(${field})`];

                    db.query(`SELECT STDDEV(${field}) from ${table}`, (error4, result_stddev) => {
                        stats.stddev = result_stddev[0][`STDDEV(${field})`];

                        return callback(stats);
                    });
                })
            });
        });
    }
};