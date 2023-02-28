const baseHeight = 300
const finalHeight = 600
const holdingHeight = 1000

function calculateDestination(lat, lon, distance, bearing) {
  const geodesic = GeographicLib.Geodesic.WGS84;
  const result = geodesic.Direct(lat, lon, bearing, distance * 0.3048);
  return {
    lat: result.lat2,
    lon: result.lon2
  };
}

var BingLayer = L.TileLayer.extend({
  getTileUrl: function(coords) {
    var quadkey = this.toQuadKey(coords.x, coords.y, coords.z)
    var url = L.Util.template(this._url, {
      q: quadkey,
      s: this._getSubdomain(coords)
    })
    if (typeof this.options.style === 'string') {
      url += '&st=' + this.options.style
    }
    return url
  },
  toQuadKey: function(x, y, z) {
    var index = ''
    for (var i = z; i > 0; i--) {
      var b = 0
      var mask = 1 << (i - 1)
      if ((x & mask) !== 0) b++
      if ((y & mask) !== 0) b += 2
      index += b.toString()
    }
    return index
  }
});

var layer = new BingLayer('http://t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1398', {
  subdomains: ['0', '1', '2', '3', '4'],
  attribution: '&copy; <a href="http://bing.com/maps">Bing Maps</a>'
});

var map = new L.Map(document.querySelector('#map'), {
  layers: [layer],
  center: new L.LatLng(52.890600, -0.905659),
  zoom: 16
});

const marker;
var landingPattern = L.polyline([
  [0, 0],
  [0, 0],
  [0, 0],
  [0, 0]
], {
  color: 'yellow'
}).addTo(map);

var crab_line = L.polyline([
  [0, 0],
  [0, 0]
], {
  color: 'yellow',
  dashArray: '5,10'
}).addTo(map);

function onMapClick(e) { // Function to handle marker placement on map click
  marker.setLatLng(e.latlng);
  updateLandingPattern();
}

function updateLandingPattern() {
  wind_speed = parseFloat(document.getElementById('wind_speed').value) || 0
  canopy_speed = parseFloat(document.getElementById('canopy_speed').value) || 0
  wind_bearing = parseFloat(document.getElementById('wind_bearing').value) || 0
  glide_ratio = parseFloat(document.getElementById('glide_ratio').value) || 0
  calculate_crab_angle = document.getElementById('calculate_crab_angle').checked

  //document.getElementById('crab_angle_p').hidden = !calculate_crab_angle


  if (calculate_crab_angle) {
    finalDistance = (baseHeight * glide_ratio) * (1 - (wind_speed / canopy_speed))
    finalBearing = wind_bearing + 180

    baseDistance = ((finalHeight - baseHeight) * glide_ratio) * (Math.sqrt(canopy_speed ** 2 - wind_speed ** 2) / canopy_speed);
    baseBearing = finalBearing + 90

    downWindDistance = ((holdingHeight - finalHeight) * glide_ratio) * ((wind_speed + canopy_speed) / canopy_speed);
    downWindBearing = wind_bearing;

    var latlngs = landingPattern.getLatLngs();
    latlngs[0] = marker.getLatLng();
    var downWind = calculateDestination(latlngs[0].lat, latlngs[0].lng, finalDistance, finalBearing)
    latlngs[1].lat = downWind.lat
    latlngs[1].lng = downWind.lon
    var crosswind = calculateDestination(latlngs[1].lat, latlngs[1].lng, baseDistance, baseBearing)
    latlngs[2].lat = crosswind.lat
    latlngs[2].lng = crosswind.lon
    var upwind = calculateDestination(latlngs[2].lat, latlngs[2].lng, downWindDistance, downWindBearing)
    latlngs[3].lat = upwind.lat
    latlngs[3].lng = upwind.lon
    landingPattern.setLatLngs(latlngs);

    var crab_angle = (Math.asin(wind_speed / canopy_speed) * 180 / Math.PI).toFixed(2)

    document.getElementById('crab_angle').textContent = crab_angle

    var latlngs = crab_line.getLatLngs();
    latlngs[0].lat = crosswind.lat
    latlngs[0].lng = crosswind.lon
    var crab_bearing_coord = calculateDestination(crosswind.lat, crosswind.lon, 0.5 * baseDistance, baseBearing + 180 - crab_angle)
    latlngs[1].lat = crab_bearing_coord.lat
    latlngs[1].lng = crab_bearing_coord.lon
    crab_line.setLatLngs(latlngs);
  } else {
    finalDistance = (baseHeight * glide_ratio) * (1 - (wind_speed / canopy_speed))
    finalBearing = wind_bearing + 180

    baseDistance = ((finalHeight - baseHeight) * glide_ratio) * (Math.sqrt(canopy_speed ** 2 + wind_speed ** 2) / canopy_speed);
    baseBearing = finalBearing + 180 - Math.atan(canopy_speed / wind_speed) * 180 / Math.PI;

    downWindDistance = ((holdingHeight - finalHeight) * glide_ratio) * ((wind_speed + canopy_speed) / canopy_speed);
    downWindBearing = wind_bearing;

    var latlngs = landingPattern.getLatLngs();
    latlngs[0] = marker.getLatLng();
    var downWind = calculateDestination(latlngs[0].lat, latlngs[0].lng, finalDistance, finalBearing)
    latlngs[1].lat = downWind.lat
    latlngs[1].lng = downWind.lon
    var crosswind = calculateDestination(latlngs[1].lat, latlngs[1].lng, baseDistance, baseBearing)
    latlngs[2].lat = crosswind.lat
    latlngs[2].lng = crosswind.lon
    var upwind = calculateDestination(latlngs[2].lat, latlngs[2].lng, downWindDistance, downWindBearing)
    latlngs[3].lat = upwind.lat
    latlngs[3].lng = upwind.lon
    landingPattern.setLatLngs(latlngs);
    
    crab_line.setLatLngs([
      [0, 0],
      [0, 0]
    ]);

    var crab_angle = (90 - Math.atan(canopy_speed / wind_speed) * 180 / Math.PI).toFixed(2)

    document.getElementById('crab_angle').textContent = crab_angle

    var latlngs = crab_line.getLatLngs();
    latlngs[0].lat = crosswind.lat
    latlngs[0].lng = crosswind.lon
    var crab_bearing_coord = calculateDestination(crosswind.lat, crosswind.lon, 0.5 * baseDistance, baseBearing + 180 - crab_angle)
    latlngs[1].lat = crab_bearing_coord.lat
    latlngs[1].lng = crab_bearing_coord.lon
    crab_line.setLatLngs(latlngs);
  }
}

map.on('click', onMapClick); // Add click event listener to map
onMapClick({
  latlng: [52.890600, -0.905659]
});
