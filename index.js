let express = require("express");
let cors = require("cors");
let bodyParser = require("body-parser");

let app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set("port", 7638);

const dataset_api = require("./dataset_api.js")(app);

app.listen(app.get("port"), () => {
    console.log(`Express Server Started on port ${app.get('port')}`)
});

module.exports = app;