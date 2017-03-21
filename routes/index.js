var user = require('../controllers/userController');
var device = require('../controllers/deviceController');
exports.route = function(app){
    
    app.post('/login',user.login);
    app.post('/register',user.register);
    app.post('/add-network',device.addNetwork);
    app.post('/forgot-password',user.forgotpassword);
    app.post('/reset-password',user.resetpassword);
    app.post('/add-device',device.adddevice);
    //app.post('/add-device',device.adddevice);
};



