module.exports = (app) => {
    const loginS = require('../controller/loginSystem');
    const Secure = require('../controller/checkToken');

    app.route('/api')
        .get(Secure,loginS.api);

    app.route('/api/signup')
        .post(loginS.Signup);

    app.route('/api/login')
        .post(loginS.Login);

    app.route('/api/retoken')
        .post(loginS.Token);
// ao wai check Aunt
    app.route('/secure')
        .get(Secure, loginS.secure);
}