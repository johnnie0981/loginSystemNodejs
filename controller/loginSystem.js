const conn = require('./dbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenList = {};
module.exports = {
    Signup: async (Request, Response) => {
        const postData = Request.body;
        const timezone = new Date().getTimezoneOffset().toString();
        const statu = 'Admin';
        if (!postData.username || !postData.password) {
            Response.json({msg: 'fill is empty'});
        }
        var salt = await bcrypt.genSaltSync(10);
        const password = await bcrypt.hashSync(postData.password, salt);
        const sql = 'CALL weather_station.User_Add(?,?,?,?,?,?)';
        await conn.query(sql, [postData.username, password, statu, timezone, '1', '1'], (error, results, fields) => {
            if (error) {
                return console.error(error.message);
            }
            return Response.send(results[0]);
        });
    },

    Login: async (Request, Response) => {
        const postData = Request.body;
        const user = {
            username: postData.username,
            password: postData.password
        }
        var ret = [];
        const sql = "CALL weather_station.user_se_nam(?)";
        await conn.query(sql, user.username, async function (err, rows) {
            if (err) throw err;
            ret = JSON.stringify(rows[0]);
            const Upass = (JSON.parse(ret)[0]);
            if (Upass.STT === 'NOT EXISTS USER') {
                return Response.json({msg: 'NOT EXISTS USER'})
            }
            const isMatch = await bcrypt.compare(user.password, Upass.password);
            if (!isMatch) {
                return Response.json({msg: 'password not match'});
            }
            if (isMatch) {
                const token = jwt.sign({usn: user.username}, process.env.SECRET, { expiresIn: JSON.parse(process.env.tokenLife)});
                const refreshToken = jwt.sign({usn: user.username}, process.env.refreshTokenSECRET, { expiresIn: JSON.parse(process.env.refreshTokenLife)});
                const response = {
                    "status": "Logged in",
                    "token": token,
                    "refreshToken": refreshToken,
                }
                tokenList[refreshToken] = response
                Response.status(200).json(response);
            }

        });
    },

    Token: async (Request, Response) => {
        const postData = Request.body;
        if ((postData.refreshToken) && (postData.refreshToken in tokenList)) {
            const user = {"usn": postData.username};
            const token = jwt.sign(user, process.env.SECRET, {expiresIn: JSON.parse(process.env.tokenLife)});
            const response = {"token": token,};
            // update the token in the list
            tokenList[postData.refreshToken].token = token;
            Response.status(200).json(response);
        } else {
            Response.status(404).send('Invalid request');
        }
    },

    secure: async (Request, Response) => {
        Response.json({msg: 'is True'})
    }
}