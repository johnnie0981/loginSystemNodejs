const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
require('dotenv').config({
    path: './config/Config.env'
})
require('./routers/loginSystem')(app);
app.listen(port, () => {
    console.log('Server run on port :', port);
});