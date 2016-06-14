var ENV = (function() {

    var localStorage = window.localStorage;

    return {
        dbName: 'locations',
        settings: {
            enabled:         localStorage.getItem('enabled')     || 'true',
            aggressive:      localStorage.getItem('aggressive')  || 'false',
            locationService: localStorage.getItem('locationService')  || 'ANDROID_DISTANCE_FILTER'
        },
        toggle: function(key) {
            var value    = localStorage.getItem(key),
                newValue = ((new String(value)) == 'true') ? 'false' : 'true';

            localStorage.setItem(key, newValue);
            return newValue;
        }
    };
})();

var app = {

    var arUbi = new Array();//arUbi.push({x:pos_x, y:pos_y, fecha:1, click:true});
   
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        document.addEventListener("offline", this.onOffline, false);
        document.addEventListener("online", this.onOnline, false);
    },

    onPause: function(){},
    onResume: function(){},
    onOffline: function(){},
    onOnline: function(){},

    onDeviceReady: function() {

        window.plugins.PushbotsPlugin.initialize("574604d54a9efad3cf8b4567", {"android":{"sender_id":"484433023834"}});
        window.plugins.PushbotsPlugin.on("registered", function(token){
           window.plugins.PushbotsPlugin.updateAlias(device.uuid);
        });

        window.addEventListener('batterystatus', app.onBatteryStatus, false);
        app.configureBackgroundGeoLocation();
        backgroundGeoLocation.getLocations(app.postLocationsWasKilled);

    },

    nBatteryStatus: function(ev) {
        app.battery = {
            level: ev.level / 100,
            is_charging: ev.isPlugged
        };
    },

    configureBackgroundGeoLocation: function() 
    {
        try
        {
            var anonDevice = app.getDeviceInfo();

            var callbackFn = function(location) {
                var data = {
                    location: {
                        uuid: new Date().getTime(),
                        timestamp: location.time,
                        battery: app.battery,
                        coords: location,
                        service_provider: ENV.settings.locationService
                    },
                    device: anonDevice
                };
                app.enviarUbicacion(location);
            };

            var failureFn = function(err) {
                alert("Error RS002: Reiniciar el APP, de persistir el problema comunicate con encargado de SISTEMAS.")
            };

            try{
                navigator.geolocation.getCurrentPosition(function(location) { console.log("location"); },function(err) { console.log("error en navigator.geolocation"); });
            }catch(er){
                alert("Error RS001: Verificar GPS y conexión de internet.")
            }
            
            backgroundGeoLocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10,//presicion
                stationaryRadius: 100,
                distanceFilter: 100,//distancia para obtener puntos
                locationTimeout: 60,
                notificationTitle: 'Background tracking',
                notificationText: 'SÚMATE',
                activityType: 'AutomotiveNavigation',
                debug: true,
                //interval: 60000,//60 segundos
                stopOnTerminate: false,
                locationService: backgroundGeoLocation.service[ENV.settings.locationService],
                fastestInterval: 5000,
                activitiesInterval: 10000
            });

            app.startTracking();
        }
        catch(er){
            alert("Error RS003: Reiniciar el APP, de persistir el problema comunicate con encargado de SISTEMAS.")
        }
    },

    startTracking: function () {
        backgroundGeoLocation.start();
    },

    getDeviceInfo: function () {
        return {
            model: device.model,
            version: device.version,
            platform: device.platform,
            uuid: device.uuid
        };
    },

    postLocationsWasKilled: function (locations) {
        var anonDevice, filtered;

        filtered = [].filter.call(locations, function(location) {
            return location.debug === false;
        });

        if (!filtered || filtered.length === 0) {
            return;
        }

        anonDevice = app.getDeviceInfo();

        /*(function postOneByOne (locations) {
            var location = locations.pop();
            if (!location) {
                return;
            }
            var data = {
                location: {
                    uuid: new Date().getTime(),
                    timestamp: location.time,
                    battery: {},
                    coords: location,
                    service_provider: 'SQLITE'
                },
                device: anonDevice
            };

            app.postLocation(data).done(function () {
                backgroundGeoLocation.deleteLocation(location.locationId,
                    function () {
                        console.log('[DEBUG]: location %s deleted', location.locationId);
                        postOneByOne(locations);
                    },
                    function (err) {
                        if (err) {
                            console.error('[ERROR]: deleting locationId %s', location.locationId, err);
                        }
                        postOneByOne(locations);
                    }
                );
            });
        })(filtered || []);*/
    },

    fechaHoraSis: function()
    {
        var dt = new Date();
        var fech = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
        return fech;
    }, 

    enviarUbicacion: function(pos)
    {
        var urlP = "http://gpsroinet.avanza.pe/mobile_controler/";
        var usu = $("#id_usu").val();
        var fec = app.fechaHoraSis();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, x:pos.latitude, y:pos.longitude, fec:fec},
            beforeSend : function (){   },
            url: urlP+"enviarUbicacion2",//enviarUbicacion
            success : function(data){ },
            error: function(data){}
        });
    }

};
