class Geo {
    
    constructor() {
        this.enabled = true;
        this.options = {
            enableHighAccuracy: true,
            timeout: 1000,
            maximumAge: 0
          };    
        if ("geolocation" in navigator) {
            this.enabled = true;
        }    
    }
    getPosition(callback) {
        if (this.enabled) {
            navigator.geolocation.getCurrentPosition(function(position) {
                callback(position.coords);
            });
        } else
            callback({'latitude':0,'longitude':0});
    }    
}