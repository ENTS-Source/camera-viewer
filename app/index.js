var express = require('express');
var RateLimit = require('express-rate-limit');
var events = require('events');
var Promise = require('bluebird');
var randomString = require('random-string');

var config = require('../config');
var appConfig = require('../config/app.json');

var cameraSource = require('./source/' + appConfig.source.type.toLowerCase());
var cameraStore = {}; // will store the current snapshot of each camera in memory
var currentHash = "FreshInstance";
var lastHashTime = new Date().getTime();

// TODO: Reduce logic in entry point

var port = process.env.PORT || config.dev.apiPort;
var dispatcher = new events.EventEmitter();

var app = express();
app.enable('trust proxy');

var limiter = new RateLimit({
    windowMs: appConfig.limits.windowMinutes * 60 * 1000,
    max: appConfig.limits.requestsPerWindow,
    delayMs: appConfig.limits.delayMs
});
app.use(limiter);

function refreshCameras() {
    var newHash = randomString({length: 64});
    var promises = [];
    for (var cameraName in appConfig.cameras) {
        //noinspection JSUnfilteredForInLoop
        promises.push(cacheCamera(cameraName));
    }

    Promise.all(promises).then(function () {
        currentHash = newHash;
        lastHashTime = new Date().getTime();
        console.log("New hash: " + newHash);
        dispatcher.emit('hash-updated', newHash);
    });
}

setInterval(function () {
    if (dispatcher.listenerCount('hash-updated') == 0) return; // nothing to do
    refreshCameras();
}, appConfig.refreshSeconds * 1000);

app.get('/api/v1/cameras', function (req, res) {
    res.json(appConfig.cameras);
});

app.get('/api/v1/camera/:name/snapshot', function (req, res) {
    if (!appConfig.cameras[req.params.name]) {
        res.status(404).json({error: "Camera not found"});
        return;
    }

    if ((new Date().getTime()) - lastHashTime >= 60 * 1000) {
        refreshCameras(); // refresh cameras if last refresh was >=60 seconds ago
    }

    if (!req.query.hasOwnProperty("lastHash") || req.query['lastHash'] != currentHash) {
        tryCacheCamera(req.params.name).then(function () {
            res.status(200).json({hash: currentHash, image: cameraStore[req.params.name]});
        }, function () {
            res.status(500).json({error: 'Internal Server Error'});
        });
    } else {
        res.set('Content-Type', 'application/json');
        res.set('Cache-Control', 'no-cache, must-revalidate');

        dispatcher.once('hash-updated', hash=>res.status(200).json({
            hash: currentHash,
            image: cameraStore[req.params.name]
        }));
    }
});

function tryCacheCamera(cameraName) {
    return new Promise(function (resolve, reject) {
        if (cameraStore[cameraName]) {
            resolve(); // already cached - automatic timer will pick it up
            return;
        }

        cacheCamera(cameraName).then(resolve, reject);
    });
}

function cacheCamera(cameraName) {
    console.log("Camera cache request: " + cameraName);
    return new Promise(function (resolve, reject) {
        cameraSource.getImage(cameraName).then(function (imageB64) {
            cameraStore[cameraName] = imageB64;
            resolve();
        }, reject);
    });
}

app.listen(port, function (error) {
    if (error) {
        console.log(error);
        return;
    }

    console.log("Listening on port " + port);
});
