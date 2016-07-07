var ENV = (function() {

    var localStorage = window.localStorage;

    return {
        dbName: 'locations',
        settings: {
            enabled:         localStorage.getItem('enabled')     || 'true',
            aggressive:      localStorage.getItem('aggressive')  || 'false',
            locationProvider: localStorage.getItem('locationProvider')  || 'ANDROID_DISTANCE_FILTER_PROVIDER'
        },
        toggle: function(key) {
            var value    = localStorage.getItem(key),
                newValue = ((new String(value)) == 'true') ? 'false' : 'true';

            localStorage.setItem(key, newValue);
            return newValue;
        }
    };
})();

var isZero = false;

var idP = 0;

var app = {

    urlPost: "http://gpsroinet.avanza.pe/mobile_controler/",
    
    dataZero: undefined,

    location: undefined,

    path: undefined,

    locations: [],
    isTracking: false,

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

    onDeviceReady: function() {
        window.addEventListener('batterystatus', app.onBatteryStatus, false);
        app.configureBackgroundGeolocation();
        backgroundGeolocation.getLocations(app.postLocationsWasKilled);
        //backgroundGeolocation.watchLocationMode(app.onLocationCheck);
    },

    /*onLocationCheck: function (enabled) {
        if (app.isTracking && !enabled) {
            var showSettings = window.confirm('No location provider enabled. Should I open location setting?');
            if (showSettings === true) {
                backgroundGeolocation.showLocationSettings();
            }
        }
    },*/

    onBatteryStatus: function(ev) {
        app.battery = {
            level: ev.level / 100,
            is_charging: ev.isPlugged
        };
        console.log('[DEBUG]: battery', app.battery);
    },

    getDeviceInfo: function () {
        return {
            model: device.model,
            version: device.version,
            platform: device.platform,
            uuid: device.uuid//md5([device.uuid, this.salt].join())
        };
    },

    configureBackgroundGeolocation: function() {
        try{
            var debug = "";
            var anonDevice = app.getDeviceInfo();

            var yourAjaxCallback = function(response) {
                backgroundGeolocation.finish();
            };

            var callbackFn = function(location) {

                /*var data = {
                    location: {
                        uuid: new Date().getTime(),
                        timestamp: location.time,
                        battery: app.battery,
                        coords: location,
                        service_provider: ENV.settings.locationProvider
                    },
                    device: anonDevice
                };*/

                if($("#id_usu").val() != 0) 
                {
                    if(location.speed == 0)
                    {
                        alert("entrando a speed 0, id: "+$("#idP").val());
                        if(isZero == false)//primera vez que reconoce velocidad cero
                        {
                            isZero = true;
                            //var pid = app.enviarUbicacionPosZero(location);
                            app.enviarUbicacionPosZero(location);

                            idP = $("#idP").val();
                            

                            debug += "primera posicion 0, idP:" + idP;
                            $("#debud_log").html(debug);

                            app.dataZero = {
                                id: idP,
                                posicion: location,
                                fechaHora: app.fechaHoraSis(),
                                fechaHoraFin: 0
                            };
                        }
                        else{
                            app.dataZero.fechaHoraFin = app.fechaHoraSis();
                            if(location.accuracy < app.dataZero.posicion.accuracy)
                            {
                                app.dataZero.posicion.latitude = location.latitude;
                                app.dataZero.posicion.longitude = location.longitude;
                                app.dataZero.posicion.accuracy = location.accuracy;
                                app.dataZero.posicion.provider = location.provider;
                            }

                            debug += "posicion 0 mas sercana,id:"+app.dataZero.id+"x:"+app.dataZero.posicion.latitude+", y:"+app.dataZero.posicion.longitude;
                            $("#debud_log").html(debug);
                        }
                    }
                    else{
                        if(typeof app.dataZero.id != 'undefined')
                        {
                            if(app.dataZero.fechaHoraFin == 0)
                            {
                                app.dataZero.fechaHoraFin = app.fechaHoraSis();
                            }

                            debug += "actualiza posicion 0,id:"+app.dataZero.id+" x:"+app.dataZero.posicion.latitude+", y:"+app.dataZero.posicion.longitude;
                            $("#debud_log").html(debug);

                            app.enviarActUbicacionPosZero(app.dataZero);
                            app.dataZero = undefined;//limpiamos los datos de detenido..
                            isZero = false;
                        }

                        app.enviarUbicacion(location);
                    }
                }

                debug += JSON.stringify(location, null, '\t')+"-----";
                $("#debud_log").html(debug);
                
            };

            var failureFn = function(err) {
                //console.log('BackgroundGeolocation err', err);
               alert("Error RS002: Reiniciar el APP, de persistir el problema comunicate con encargado de SISTEMAS.")
            };

            try{
                navigator.geolocation.getCurrentPosition(function(location) { console.log("location"); },function(err) { console.log("error en navigator.geolocation"); });
            }catch(er){
                alert("Error RS001: Verificar GPS y conexión de internet.")
            }
            
            backgroundGeolocation.configure(callbackFn, failureFn, {
                desiredAccuracy: 10,
                stationaryRadius: 50,
                distanceFilter: 50,
                interval: 30000,
                activityType: 'AutomotiveNavigation',
                debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
                stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
                locationProvider: backgroundGeolocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER,//ANDROID_ACTIVITY_PROVIDER,//backgroundGeolocation.provider[ENV.settings.locationProvider],
                fastestInterval: 5000,
                activitiesInterval: 10000
            });
            
            app.startTracking();
        }catch(er){
            alert("Error RS003: Reiniciar el APP, de persistir el problema comunicate con encargado de SISTEMAS."+er)
        }
    },

    onPause: function() {
        console.log('- onPause');
        try{
            //navigator.geolocation.watchPosition(app.enviarUbicacion, app.onError, { maximumAge: 3000, timeout: 5000, enableHighAccuracy: true } );
        }catch(er){
            alert("ERROR ONPAUSE"+er)
        }
        // app.stopPositionWatch();
    },

    onError: function(){

    },

    onResume: function() {
        console.log('- onResume');
    },

    startTracking: function () {
        backgroundGeolocation.start();
        /*app.isTracking = true;
        backgroundGeolocation.isLocationEnabled(app.onLocationCheck);*/
    },

    stopTracking: function () {
        backgroundGeolocation.stop();
        app.isTracking = false;
    },

    postLocation: function (data) {
        /*return $.ajax({
            url: app.postUrl,
            type: 'POST',
            data: JSON.stringify(data),
            // dataType: 'html',
            contentType: 'application/json'
        });*/
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

        (function postOneByOne (locations) {
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
                backgroundGeolocation.deleteLocation(location.locationId,
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
        })(filtered || []);
    },

    //navigator.geolocation.getCurrentPosition(app.onSuccessA, app.onError, { maximumAge: 3000, timeout: 15000, enableHighAccuracy: true });
        
    fechaHoraSis: function() {
        var dt = new Date();
        var fech = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
        return fech;
    },

    enviarUbicacion: function(pos) {
        var urlP = app.urlPost;//"http://gpsroinet.avanza.pe/mobile_controler/";
        var usu = $("#id_usu").val();
        var fec = app.fechaHoraSis();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, x:pos.latitude, y:pos.longitude, speed:pos.speed, accuracy:pos.accuracy, proveedor:pos.provider, fec:fec},
            beforeSend : function (){   },
            url: urlP+"enviarUbicacion2",
            success : function(data){ },
            error: function(data){
                //nuevaPosicion();
            }
        });
    },

    enviarUbicacionPosZero: function(pos) {
        var urlP = app.urlPost;//"http://gpsroinet.avanza.pe/mobile_controler/";
        var usu = $("#id_usu").val();
        var fec = app.fechaHoraSis();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, x:pos.latitude, y:pos.longitude, speed:pos.speed, accuracy:pos.accuracy, proveedor:pos.provider, fec:fec},
            url: urlP+"enviarUbicacionPosZero",
            success : function(dato)
            { 
                $("#idP").val(dato);
                $("#lugar").val(dato);
            },
            error: function(data){
                alert("error: "+JSON.stringify(data));
            }
        });
    },

    enviarActUbicacionPosZero: function(datos) {
        var pos = datos.posicion;
        var urlP = app.urlPost;//"http://gpsroinet.avanza.pe/mobile_controler/";
        var usu = $("#id_usu").val();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, idpos:datos.id, x:pos.latitude, y:pos.longitude, accuracy:pos.accuracy, proveedor:pos.provider, fechaFin:datos.fechaHoraFin},
            url: urlP+"enviarActUbicacionPosZero",
            success : function(data){ 
                //return data;
            },
            error: function(data){
                //nuevaPosicion();
            }
        });
    }

};

app.initialize();
