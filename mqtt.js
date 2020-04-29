const conn = require('./controller/dbConnection')
const mqtt = require('mqtt');
const Topic = process.env.mqtt_topic;
const Broker_URL = process.env.mqtt_Broker_URL;
const options = {
    clientId: process.env.mqtt_clientId,
    port: JSON.parse(process.env.mqtt_port),
    username: process.env.mqtt_username,
    password: process.env.mqtt_password,
    keepalive: JSON.parse(process.env.mqtt_keepalive)
};
const client = mqtt.connect(Broker_URL, options);
client.on('connect', mqtt_connect);
client.on('message', mqtt_messsageReceived);

function mqtt_connect() {
    client.subscribe(Topic, mqtt_subscribe);
};

function mqtt_subscribe(err, granted) {
    if (err) {
        console.log('Error:' + err);
    }
};

async function mqtt_messsageReceived(topic, message, packet) {
    try {
        const messJ = await JSON.parse(message);
        //CALL ws_nb.add_data(:tempe,:humi,:dirac,:speed,:gust,:rain,:dtime,:st)
        const sql = "CALL ws_nb.add_data(?,?,?,?,?,?,?,?)"
        conn.query(sql, [messJ.temperature_C, messJ.humidity, messJ.direction_deg, messJ.speed, messJ.gust, messJ.rain, messJ.time, true] , (error, results) => {
            if (error) throw error;
            //console.log(results)
        })
        //console.log(data)
    } catch (err) {
        //console.log(err);
    }
};