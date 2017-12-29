// Inital Map Object
var map = L.map("map", {
    center: [39.8283, -98.5785],
    zoom: 3
});

// Adding Tile Layer
L.tileLayer("https://api.mapbox.com/styles/v1/sharanyavb/cjaokq946fjvx2snwmjnx0l1q/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hhcmFueWF2YiIsImEiOiJjamFrOXl2NzYyZmR4MnFwZGRqbmQ0NDBmIn0.xb-23_pXhUnBRBfjVJ1CJA").addTo(map);

// Function to choose color
function chooseColor(magnitude) {
   if (magnitude <= 1) {
       return "greenyellow";
   } else if (magnitude <= 2) {
       return "yellowgreen";
   } else if (magnitude <= 3) {
       return "yellow";
   } else if (magnitude <= 4) {
       return "gold";
   } else if (magnitude <= 5) {
       return "orange";
   } else {
       return "red";
   };
};

// Function to change marker size
function markerSize(magnitude) {
    return magnitude;
};

// Query URLs
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var URL2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// API Call
d3.json(queryURL, function(error, data) {
    if (error) console.log(error);

    // console.log(data);

    // Create a GeoJSON Layer
    L.geoJSON(data, {

        onEachFeature: function(feature) {

            L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                fillOpacity: 1,
                color: chooseColor(feature.properties.mag),
                fillColor: chooseColor(feature.properties.mag),
                radius: markerSize(feature.properties.mag)
            })
            .bindPopup("<h1>" + feature.properties.place + "</h1> <hr> <h3>Magnitude: " + feature.properties.mag + "</h3>")
            .addTo(map);

        }
    });
});

// Adding Legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 1, 2, 3, 4, 5],
                labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);