const db_utils = require("./db_utils.js");
const bodyParser = require("body-parser");
var now = require("performance-now");
const Json2csvParser = require('json2csv').Parser;

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

            },
            "pings": {

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

                                                db.query("SELECT COUNT(*) AS total from ping_data;", (error6, result6, fields6) => {
                                                    if(error6){
                                                        res.status(500).send(error6);
                                                    } else {
                                                        data.pings.entries = result6[0].total;

                                                        db.query("SELECT * FROM ping_data ORDER BY id DESC LIMIT 1;", (error7, result7, fields7) => {
                                                            if(error7){
                                                                res.status(500).send(error7);
                                                            } else {
                                                                data.pings.last_entry = result7[0].timestamp;
                                                                
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
                    }
                });
            }
        });

    });

    app.get(API_PATH + "/airports", (req, res) => {
        if(req.query.data === "all"){
            const start_time = now();
            let end_time;

            let db = db_utils.connectDatabase();

            db.query("SELECT * FROM airport_data", (error, result, fields) => {
                if(error){
                    res.status(500).send(error);
                } else {
                    const format = req.query.format;

                    if(format === "json"){

                        end_time = now();

                        res.set("Content-Type", "application/octet-stream");
                        res.set("Content-Disposition", "attachment;filename=airports.json");
                        res.status(200).send(result);
                    } else if(format === "csv"){
                        const fields = ["id", "timestamp", "airport", "temp", "forecast", "visibility", "wind", "delay", "latency"];
                        const opts = {fields};

                        try {
                            const parser = new Json2csvParser(opts);
                            const csv = parser.parse(result);

                            end_time = now();

                            res.set("Content-Type", "application/octet-stream");
                            res.set("Content-Disposition", "attachment;filename=airports.csv");
                            res.status(200).send(csv);
                        } catch(csv_error){
                            console.error(csv_error);
                            res.status(500).send("A server error occurred converting data to CSV. Please try again or another format.");
                        }
                    }

                }
            });
        } else {
            res.status(400).send("Invalid parameters");
        }
    });

    app.get(API_PATH + "/mirrors", (req, res) => {
        if(req.query.data === "all"){
            const start_time = now();
            let end_time;

            let db = db_utils.connectDatabase();

            db.query("SELECT * FROM mirror_data", (error, result, fields) => {
                if(error){
                    res.status(500).send(error);
                } else {
                    const format = req.query.format;

                    if(format === "json"){

                        end_time = now();

                        res.set("Content-Type", "application/octet-stream");
                        res.set("Content-Disposition", "attachment;filename=mirrors.json");
                        res.status(200).send(result);
                    } else if(format === "csv"){
                        const fields = ["id", "timestamp", "server", "latency"];
                        const opts = {fields};

                        try {
                            const parser = new Json2csvParser(opts);
                            const csv = parser.parse(result);

                            end_time = now();

                            res.set("Content-Type", "application/octet-stream");
                            res.set("Content-Disposition", "attachment;filename=mirrors.csv");
                            res.status(200).send(csv);
                        } catch(csv_error){
                            console.error(csv_error);
                            res.status(500).send("A server error occurred converting data to CSV. Please try again or another format.");
                        }
                    }

                }
            });
        } else {
            res.status(400).send("Invalid parameters");
        }
    });
}