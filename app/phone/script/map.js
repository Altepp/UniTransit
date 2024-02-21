const map = L.map("map");

var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var osmAttrib = 'Map data © OpenStreetMap contributors';
var osm = new L.TileLayer(osmUrl, {
    attribution: osmAttrib
});

map.setView([47.0, 3.0], 6);
map.addLayer(osm);





function loopforAttribution() {
    let attribution = document.getElementsByClassName('leaflet-control-attribution leaflet-control')[0];
    if (attribution) {
        attribution.parentElement.classList = 'leaflet-top leaflet-right';
        console.log('Attrib set to top');
    } else {
        console.log('Waiting for attrib');
        loopforAttribution();
    }
}

loopforAttribution();