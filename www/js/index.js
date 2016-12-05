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

var debug = "";

var dataZero = {
                id: 0,
                posicion: {},
                fechaHora: 0,
                fechaHoraFin: 0
            };

var app = {

    urlPost: "http://gpsroinet.avanza.pe/mobile_controler/",

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
    },

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
            
            var anonDevice = app.getDeviceInfo();
            var contZero = 0; //para contar cuantas veces seguida su posicion es 0

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
                    try{
                        /*if(location.speed <= 0.5)
                        {
                            contZero += 1;
                            if(isZero == false)//primera vez que reconoce velocidad cero
                            {
                                app.enviarUbicacionPosZero(location)

                            }else{
                                dataZero.fechaHoraFin = app.fechaHoraSis();
                                if(location.accuracy < dataZero.posicion.accuracy)
                                {
                                    dataZero.posicion.latitude = location.latitude;
                                    dataZero.posicion.longitude = location.longitude;
                                    dataZero.posicion.accuracy = location.accuracy;
                                    dataZero.posicion.provider = location.provider;
                                }

                                //debug += "DEBUG 2,id: "+dataZero.id+" -- x:"+dataZero.posicion.latitude+", y:"+dataZero.posicion.longitude+", Accu:"+dataZero.posicion.accuracy+", Prov:"+dataZero.posicion.provider;
                                //$("#debud_log").html(debug);
                            }
                        }else{
                            if(contZero >= 2)
                            {
                                if(dataZero.id != 0)
                                {
                                    if(dataZero.fechaHoraFin == 0)
                                    {
                                        dataZero.fechaHoraFin = app.fechaHoraSis();
                                    }
                                    app.enviarActUbicacionPosZero(dataZero);
                                }
                            }
                            contZero = 0;//volvemos a 0 el contador de posiciones 0
                            app.limpiarDataZero();
                            isZero = false;*/
                            
                            app.enviarUbicacion(location);
                        //}
                    }catch(er){
                        alert("ERROR AL ENVIAR POS: "+ er)
                    }
                }
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
                notificationTitle: 'SUMATE',
                notificationText: 'GPS',
                notificationIconColor: '#489ad0',
                activityType: 'AutomotiveNavigation',
                debug: false,//true, // <-- enable this hear sounds for background-geolocation life-cycle.
                stopOnTerminate: false, // <-- enable this to clear background location settings when the app terminates
                locationProvider: backgroundGeolocation.provider.ANDROID_DISTANCE_FILTER_PROVIDER,//ANDROID_ACTIVITY_PROVIDER,//backgroundGeolocation.provider[ENV.settings.locationProvider],
                fastestInterval: 5000,
                activitiesInterval: 10000
            });
            
            app.startTracking();
        }
        catch(er){
            alert("Error RS003: Reiniciar el APP, de persistir el problema comunicate con encargado de SISTEMAS."+er)
        }
    },

    limpiarDataZero: function(){
        dataZero = {
                id: 0,
                posicion: {},
                fechaHora: 0,
                fechaHoraFin: 0
            };
    },

    onPause: function() {
        console.log('- onPause');
    },

    onError: function(){

    },

    onResume: function() {
        console.log('- onResume');
    },

    startTracking: function () {
        backgroundGeolocation.start();
    },

    stopTracking: function () {
        backgroundGeolocation.stop();
        app.isTracking = false;
    },

    postLocation: function (data) {

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
            data: {usu:usu, x:pos.latitude, y:pos.longitude, speed:pos.speed, accuracy:pos.accuracy, proveedor:pos.provider, fec:fec, nbat: app.battery.level},
            beforeSend : function (){   },
            url: urlP+"enviarUbicacion2",
            success : function(data){ },
            error: function(data){
                //alert("Error posicion log");
            }
        });
    },

    enviarUbicacionPosZero: function(pos) {
        var urlP = app.urlPost;
        var usu = $("#id_usu").val();
        var fec = app.fechaHoraSis();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, x:pos.latitude, y:pos.longitude, speed:pos.speed, accuracy:pos.accuracy, proveedor:pos.provider, fec:fec, nbat:app.battery.level},
            url: urlP+"enviarUbicacionPosZero",
            success : function(dato)
            { 
                dataZero.id = dato;
                dataZero.posicion = pos;
                dataZero.fechaHora = app.fechaHoraSis();
                isZero = true;
            },
            error: function(data){
                //alert("Error posicion log cero");
            }
        });
    },

    enviarActUbicacionPosZero: function(datos) {
        var pos = datos.posicion;
        var urlP = app.urlPost;
        var usu = $("#id_usu").val();
        $.ajax({
            type: 'POST',
            dataType: 'json', 
            data: {usu:usu, idpos:datos.id, x:pos.latitude, y:pos.longitude, accuracy:pos.accuracy, proveedor:pos.provider, fechaFin:datos.fechaHoraFin, nbat:app.battery.level},
            url: urlP+"enviarActUbicacionPosZero",
            success : function(data){ },
            error: function(data){
                //alert("error update cero")
            }
        });
    }

};

app.initialize();
