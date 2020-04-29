const conn = require('./dbConnection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
module.exports = {

    Signup: async (Request, Response) => {
        await check('username','fill in Empty').notEmpty().run(Request);
        await check('password','password must be at least 5 chars long').notEmpty().isLength({ min: 5 }).run(Request);
        const postData = Request.body;
        const timezone = new Date().getTimezoneOffset().toString();
        const statu = 'Admin';
        const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
            return `${location}[${param}]: ${msg}`;
          };
        const result = validationResult(Request).formatWith(errorFormatter);
        if (!result.isEmpty()) {
            return Response.status(422).json({ errors: result.array() });
          }
        var salt = await bcrypt.genSaltSync(10);
        const password = await bcrypt.hashSync(postData.password, salt);
        // const sql = 'INSERT INTO users (username, password, status, timezone, stt) values (?, ?, ?, ?, ?)';
        const sql = 'CALL ws_nb.add_new_user(?,?,?,?,?)';
        await conn.query(sql, [postData.username, password, statu, timezone, true,], (error, results, fields) => {
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
        const sql = "CALL ws_nb.check_user(?)";
        await conn.query(sql, user.username, async function (error, results) {
            if (error) throw error;
            ret = JSON.stringify(results[0]);
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
                const tkdate = new Date();
                const sql1 = "CALL ws_nb.add_refresh_token(?,?,?)";
                conn.query(sql1, [user.username, refreshToken, tkdate], (error, results) => {
                    if (error) {
                        return console.error(error.message);
                    }
                    const response = {
                        "status": "Logged in",
                        "token": token,
                        "refreshToken": refreshToken,
                        "results": results[0]
                    }
                    return Response.status(200).json(response);
                })
            }
        });
    },

    Token: async (Request, Response) => {
        const postData = Request.body;
        var ret = [];
        const sql = "CALL ws_nb.selete_refresh_token(?)";
        conn.query(sql, postData.username, (error, results) => {
            if (error) {
                return console.error(error.message);
            }
            ret = JSON.stringify(results[0]);
            const token_re = (JSON.parse(ret)[0]);
            if ((postData.refreshToken) === (token_re.login_token)) {
                const user = {"usn": postData.username};
                const token = jwt.sign(user, process.env.SECRET, {expiresIn: JSON.parse(process.env.tokenLife)});
                // update the token in the list
                const refreshToken = jwt.sign({user}, process.env.refreshTokenSECRET, { expiresIn: JSON.parse(process.env.refreshTokenLife)});
                const tkdate = new Date();
                const response = {"token": token, "refreshToken":refreshToken};
                const sql1 = "CALL ws_nb.add_refresh_token(?,?,?)";
                conn.query(sql1, [postData.username, refreshToken, tkdate], (error, results) => {
                        if (error) {
                            return console.error(error.message);
                        }
                        return Response.status(200).json(response);
                    })
                } else {
                Response.status(404).send('Invalid request');
                }
        })
    },

    api: async (Request, Response) => {
        Response.json({msg: 'OK'})
    },

    secure: async (Request, Response) => {
        Response.json({msg: 'is True'})
    }
}