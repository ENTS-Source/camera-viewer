var request = require('request');
var Promise = require("bluebird");
var base64 = require('base64-stream');

var appConfig = require('../../config/app.json');

module.exports = {
    getImage: function (cameraName) {
        return new Promise(function (resolve, reject) {
            var url = appConfig.source.url + "/image/" + cameraName + "?q=" + appConfig.source.quality;
            try {
                var stream = request.get(url).pipe(base64.encode());
                var result = "";

                stream.on('data', function (d) {
                    result += d;
                });
                stream.on('end', function () {
                    resolve(result);
                });

                stream.on('error', function () {
                    reject();
                });
            } catch (e) {
                reject(e);
            }
        });
    }
};