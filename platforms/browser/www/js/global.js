$(document).ready(function () {

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
	    if (!options.desiredAccuracy) options.desiredAccuracy = 20; // Default 20 meters
	    if (!options.timeout) options.timeout = options.maxWait; // Default to maxWait

	    options.maximumAge = 0; // Forzar solo ubicaciones actuales
	    options.enableHighAccuracy = true; // Fuerza alta precisión (de lo contrario, ¿por qué está usando esta función?)

	    var watchID = navigator.geolocation.watchPosition(checkLocation, onError, options);
	    var timerID = setTimeout(stopTrying, options.maxWait); // Set a timeout that will abandon the location loop
	}
}