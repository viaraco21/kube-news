var express = require('express');
var router = express.Router();
const os = require('os')

let isHealth = true;
let readTime = new Date(Date.now());
let isRead = () => { 
    return readTime < new Date(Date.now());
};
const healthControlToken = process.env.HEALTH_CONTROL_TOKEN;

const requireHealthControlToken = (req, res, next) => {
    if (!healthControlToken || req.get('x-health-control-token') !== healthControlToken) {
        return res.sendStatus(403);
    }

    return next();
};

router.get('/ready', (req, res) => {
   
    if (isRead()) {
        res.statusCode = 200;
        return res.send('Ok');
    } else {
        res.statusCode = 500;
        return res.send('');
    }   
});

router.get('/health', (req, res) => {
    
    res.json({
        state: 'up',
        machine: os.hostname()
    });
});

router.put('/unhealth', requireHealthControlToken, (req, res) => {

    isHealth = false;
    res.send("OK");
});

router.put('/unreadyfor/:seconds', requireHealthControlToken, (req, res) => {
    
    const dado = new Date(new Date(Date.now()).getTime() + (1000 * req.params.seconds));
    readTime = dado;    
    res.send("OK");
});

var healthMid = function (req, res, next) {
    
    if (isHealth) {
        next();
    } else {
        res.statusCode = 500;
        return res.send('');
    }   
};

exports.routers = router;
exports.middlewares = { healthMid };