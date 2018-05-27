const db_utils = require("./db_utils.js");
const bodyParser = require("body-parser");
var now = require("performance-now")

const API_PATH = "/datasets";

module.exports = function(app){
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.get(API_PATH + "/getGeneralInfo", (req,res) => {
        let db = db_utils.connectDatabase();

        let data = {
            "mirrors": {

            },
            "airports": {

            }
        };

        // MIRRORS DATA
        db.query("SELECT COUNT(*) AS total FROM mirror_data;", (error, result, fields) => {
            if(error){
                res.status(500).send(error);
            } else {
                data.mirrors.entries = result[0].total;

                // MIRRORS DATA
                db.query("SELECT * FROM mirror_data ORDER BY id DESC LIMIT 1;", (error2, result2, fields2) => {
                    if(error2){
                        res.status(500).send(error2);
                    } else {
                        data.mirrors.last_entry = result2[0].timestamp;

                        // AIRPORT DATA
                        db.query("SELECT COUNT(*) AS total FROM airport_data;", (error3, result3, fields3) => {
                            if(error3){
                                res.status(500).send(error3);
                            } else {
                                data.airports.entries = result3[0].total;

                                // AIRPORT DATA
                                db.query("SELECT * FROM airport_data ORDER BY id DESC LIMIT 1;", (error4, result4, fields4) => {
                                    if(error4){
                                        res.status(500).send(error4);
                                    } else {
                                        data.airports.last_entry = result4[0].timestamp;

                                        // AIRPORT DATA
                                        db.query("SELECT DISTINCT(airport) AS airport FROM airport_data ORDER BY airport DESC;", (error5, result5, fields5) => {
                                            if(error5){
                                                res.status(500).send(error5);
                                            } else {
                                                let airports = [];

                                                result5.map((row) => {
                                                    airports.push(row.airport);
                                                });

                                                data.airports.list_of_airports = airports;
                                                res.status(200).send(data);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

    });

    app.get(API_PATH + "/mirrors", (req, res) => {
        if(req.query.data === "all"){
            const start_time = now();
            let end_time;

            let db = db_utils.connectDatabase();

            db.query("SELECT * FROM mirror_data", (error, result, fields) => {
                end_time = now();

                let data = {
                    execution_time: (end_time - start_time),
                    results: result
                }

                db.end();

                if(error){
                    res.status(500).send(error);
                } else {
                    res.status(200).send(data);
                }
            });
        } else {
            res.send(400);
        }
    });
}