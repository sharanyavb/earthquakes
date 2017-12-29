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
}

// Function to edit marker size
function markerSize(magnitude) {
    return magnitude * 50000;
};

// Store our API endpoints
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the earthquake URL
d3.json(earthquakeURL, function(data) {
    // Store response into earthquakeData
    var earthquakeData = data.features;
    // Perform a GET request to the fault lines URL
    d3.json(faultLinesURL, function(data) {
        // Store response into faultLineData
        var faultLineData = data.features;

        // Pass data into createFeatures
        createFeatures(earthquakeData, faultLineData);
    });
});

// Function to create features
function createFeatures(earthquakeData, faultLineData) {

    // Define two functions we want to run once for each feature in earthquakeData
    // Create bubbles for each earthquake and add a popup describing the place, time, and magnitude of each
    function onEachQuakeLayer(feature, layer) {
        return new L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: 1,
            color: chooseColor(feature.properties.mag),
            fillColor: chooseColor(feature.properties.mag),
            radius: markerSize(feature.properties.mag)
        });
    }
    function onEachEarthquake(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    };

    // Define a function we want to run once for each feature in faultLineData
    // Create fault lines
    function onEachFaultLine(feature, layer) {
        L.polyline(feature.geometry.coordinates);  
    };

    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachEarthquake function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachEarthquake,
        pointToLayer: onEachQuakeLayer
    });

    // Create a GeoJSON layer containing the features array on the faultLineData object
    // Run the onEachFaultLine function once for each piece of data in the array
    var faultLines = L.geoJSON(faultLineData, {
        onEachFeature: onEachFaultLine,
        style: {
            weight: 2,
            color: 'orange'
        }
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes, faultLines);
};

// Function to create map
function createMap(earthquakes, faultLines) {

    // Define satellite, grayscale, and outdoors layers
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/sharanyavb/cjaok51va1a1d2rmpvyeudxw0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hhcmFueWF2YiIsImEiOiJjamFrOXl2NzYyZmR4MnFwZGRqbmQ0NDBmIn0.xb-23_pXhUnBRBfjVJ1CJA");
    var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/sharanyavb/cjaokp4001aks2rmpekik3wjk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hhcmFueWF2YiIsImEiOiJjamFrOXl2NzYyZmR4MnFwZGRqbmQ0NDBmIn0.xb-23_pXhUnBRBfjVJ1CJA");
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/sharanyavb/cjaokq946fjvx2snwmjnx0l1q/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2hhcmFueWF2YiIsImEiOiJjamFrOXl2NzYyZmR4MnFwZGRqbmQ0NDBmIn0.xb-23_pXhUnBRBfjVJ1CJA");

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Fault Lines": faultLines
    };

    // Create our map, giving it the satellite, earthquakes and faultLines layers to display on load
    var map = L.map("map", {
        center: [39.8283, -98.5785],
        zoom: 3,
        layers: [satellite, earthquakes, faultLines]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

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
};