cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/pushbots-cordova-plugin/www/pushbots.js",
        "id": "pushbots-cordova-plugin.PushbotsPlugin",
        "pluginId": "pushbots-cordova-plugin",
        "clobbers": [
            "PushbotsPlugin"
        ]
    },
    {
        "file": "plugins/cordova-plugin-mauron85-background-geolocation/www/backgroundGeoLocation.js",
        "id": "cordova-plugin-mauron85-background-geolocation.backgroundGeoLocation",
        "pluginId": "cordova-plugin-mauron85-background-geolocation",
        "clobbers": [
            "backgroundGeoLocation"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.2.1",
    "pushbots-cordova-plugin": "1.3.6",
    "cordova-plugin-mauron85-background-geolocation": "1.0.2"
}
// BOTTOM OF METADATA
});