exports.AddToLat = (lat, lng, dis) => {
    // Convert distance to radians
    const disRadians = dis / 6371;
  
    // Add distance to latitude
    const newLat = lat + disRadians;
  
    return newLat;
};
 
exports.AddToLng = (lat, lng, dis) => {
    // Convert distance to radians
    const disRadians = dis / 6371;
  
    // Calculate factor of correction
    const factorOfCorrection = Math.cos(lat * Math.PI / 180);
  
    // Add distance to longitude, applying factor of correction
    const newLng = lng + (disRadians / factorOfCorrection);
  
    return newLng;
};


exports.isCoordinateWithinZone = (centerLat, centerLng, dis, targetLat, targetLng) => {
    var R = 6371; // km
    var dLat = toRad(targetLat-centerLat);
    var dLon = toRad(targetLng-centerLng);
    var lat1 = toRad(centerLat);
    var lat2 = toRad(targetLat);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    //console.log("all", centerLat, centerLng, dis, targetLat, targetLng)
//
    //console.log("a", a)
    //console.log("c", c)
//
    //console.log("d", d)
    return d<=dis;
  };
  

    // Converts numeric degrees to radians
    function toRad(Value) 
    {
        return Value * Math.PI / 180;
    }
