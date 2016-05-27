navigator.geolocation.getAccurateCurrentPosition = function (geolocationSuccess, geolocationError, options) {
    var lastCheckedPosition;
    var locationEventCount = 0;

    options = options || {};

    var checkLocation = function (position) {
        lastCheckedPosition = position;
        ++locationEventCount;
        
        if ((position.coords.accuracy <= options.desiredAccuracy) && (locationEventCount > 0)) {
            clearTimeout(timerID);
            navigator.geolocation.clearWatch(watchID);
            foundPosition(position);
        } else {
            //console.log("en progreso: "+ position)
        }
    }

    var stopTrying = function () {
        navigator.geolocation.clearWatch(watchID);
        foundPosition(lastCheckedPosition);
    }

    var onError = function (error) {
        clearTimeout(timerID);
        navigator.geolocation.clearWatch(watchID);
        geolocationError(error);
    }

    var foundPosition = function (position) {
        geolocationSuccess(position);
    }

    if (!options.maxWait) options.maxWait = 10000; // Default 10 seconds
    if (!options.desiredAccuracy) options.desiredAccuracy = 10; // Default 20 meters
    if (!options.timeout) options.timeout = options.maxWait; // Default to maxWait

    options.maximumAge = 0; // Forzar solo ubicaciones actuales
    options.enableHighAccuracy = true; // Fuerza alta precisión (de lo contrario, ¿por qué está usando esta función?)

    var watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
    var timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
}

var app = {
   
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        //app.receivedEvent('deviceready');

        window.plugins.PushbotsPlugin.initialize("574604d54a9efad3cf8b4567", {"android":{"sender_id":"484433023834"}});
        
        window.plugins.PushbotsPlugin.on("registered", function(token){
           window.plugins.PushbotsPlugin.updateAlias(device.uuid);
        });

        //navigator.geolocation.getAccurateCurrentPosition(app.onSuccess, app.onError, { desiredAccuracy: 50, maxWait: 60000 });

    },

    //onSuccess: function(position) {},

    onSuccessA: function(position) {
        enviarUbicacion(position.coords.latitude, position.coords.longitude)//x,y
    }

    //onError: function(error) {}

    /*receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }*/
};

var arUbi = new Array();//arUbi.push({x:pos_x, y:pos_y, fecha:1, click:true});

function nuevaPosicion()
{    
    navigator.geolocation.getAccurateCurrentPosition(app.onSuccessA, app.onError, { desiredAccuracy: 50, maxWait: 15000 });   
}

function fechaHoraSis()
{
    var dt = new Date();
    var fech = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-'+dt.getDate()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
    return fech;
}

function enviarUbicacion(x,y)
{
    var urlP = "http://gpsroinet.avanza.pe/mobile_controler/";
    var usu = $("#id_usu").val();
    var fec = fechaHoraSis();
    $.ajax({
        type: 'POST',
        dataType: 'json', 
        data: {usu:usu, x:x, y:y, fec:fec},
        beforeSend : function (){   },
        url: urlP+"enviarUbicacion",
        success : function(data) 
        {

        },
        error: function(data){
            nuevaPosicion();
        }
    });
}

function fechaHora()
{
    var dt = new Date();
    var fech = dt.getDate()+'/'+(dt.getMonth()+1)+'/'+dt.getFullYear()+' '+dt.getHours()+':'+dt.getMinutes()+':'+dt.getSeconds();
    return fech;
}
