module.exports = (app) => {
    const loginS = require('../controller/loginSystem');
    const secure = require('../controller/checkToken');
    
    app.route('/signup')
        .post(loginS.Signup);

    app.route('/login')
        .post(loginS.Login);

    app.route('/retoken')
        .post(loginS.Token);

    app.route('/secure')
        .get(secure,loginS.secure);
}