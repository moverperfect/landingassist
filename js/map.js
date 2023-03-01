/* global GeographicLib, L */
const baseHeight = 300
const finalHeight = 600
const holdingHeight = 1000

function calculateDestination (lat, lon, distance, bearing) {
  const geodesic = GeographicLib.Geodesic.WGS84
  const result = geodesic.Direct(lat, lon, bearing, distance * 0.3048)
  return {
    lat: result.lat2,
    lon: result.lon2
  }
}

class BingLayer extends L.TileLayer {
  toQuadKey (x, y, z) {
    let index = ''
    for (let i = z; i > 0; i--) {
      let b = 0
      const mask = 1 << (i - 1)
      if ((x & mask) !== 0) b++
      if ((y & mask) !== 0) b += 2
      index += b.toString()
    }
    return index
  }

  getTileUrl (coords) {
    const quadkey = toQuadKey(coords.x, coords.y, coords.z) // eslint-disable-line no-undef
    const subdomain = this._getSubdomain(coords)
    const hasStyle = typeof this.options.style === 'string'
    const url = L.Util.template(this._url, {

      q: quadkey,
      s: subdomain
    })
    return hasStyle ? `${url}&st=${this.options.style}` : url
  }
}

const layer = new BingLayer(
  'http://t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1398',
  {
    subdomains: ['0', '1', '2', '3', '4'],
    attribution: '&copy; <a href="http://bing.com/maps">Bing Maps</a>'
  }
)

const map = L.map(document.querySelector('#map'), {

  layers: [layer],
  center: [52.8906, -0.905659],
  zoom: 16
})

const landingPattern = L.polyline(

  [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ],
  {
    color: 'yellow'
  }
).addTo(map)

const crabLine = L.polyline(

  [
    [0, 0],
    [0, 0]
  ],
  {
    color: 'yellow',
    dashArray: '5,10'
  }
).addTo(map)

const marker = L.marker([52.8906, -0.905659]).addTo(map)

function onMapClick (e) {
  marker.setLatLng(e.latlng)
  updateLandingPattern()
}

function updateLandingPattern () {
  const windSpeedInput = document.getElementById('wind_speed')
  const canopySpeedInput = document.getElementById('canopy_speed')
  const windBearingInput = document.getElementById('wind_bearing')
  const glideRatioInput = document.getElementById('glide_ratio')
  const calculateCrabAngleCheckbox = document.getElementById(
    'calculate_crab_angle'
  )

  const windSpeed = parseFloat(windSpeedInput.value) || 0
  const canopySpeed = parseFloat(canopySpeedInput.value) || 0
  const windBearing = parseFloat(windBearingInput.value) || 0
  const glideRatio = parseFloat(glideRatioInput.value) || 0
  const calculateCrabAngle = calculateCrabAngleCheckbox.checked

  // document.getElementById('crab_angle_p').hidden = !calculate_crab_angle

  if (calculateCrabAngle) {
    const finalDistance =
      baseHeight * glideRatio * (1 - windSpeed / canopySpeed)
    const finalBearing = windBearing + 180

    const baseDistance =
      (finalHeight - baseHeight) ** glideRatio *
      (Math.sqrt(canopySpeed ** 2 - windSpeed ** 2) / canopySpeed)
    const baseBearing = finalBearing + 90

    const downWindDistance =
      (holdingHeight - finalHeight) *
      glideRatio *
      ((windSpeed + canopySpeed) / canopySpeed)
    const downWindBearing = windBearing

    const latlngs = landingPattern.getLatLngs()
    latlngs[0] = marker.getLatLng()
    const downWind = calculateDestination(
      latlngs[0].lat,
      latlngs[0].lng,
      finalDistance,
      finalBearing
    )
    latlngs[1].lat = downWind.lat
    latlngs[1].lng = downWind.lon
    const crosswind = calculateDestination(
      latlngs[1].lat,
      latlngs[1].lng,
      baseDistance,
      baseBearing
    )
    latlngs[2].lat = crosswind.lat
    latlngs[2].lng = crosswind.lon
    const upwind = calculateDestination(
      latlngs[2].lat,
      latlngs[2].lng,
      downWindDistance,
      downWindBearing
    )
    latlngs[3].lat = upwind.lat
    latlngs[3].lng = upwind.lon
    landingPattern.setLatLngs(latlngs)

    const crabAngle = (
      (Math.asin(windSpeed / canopySpeed) * 180) /
      Math.PI
    ).toFixed(2)
    document.getElementById('crab_angle').textContent = crabAngle

    const crabBearingCoord = calculateDestination(
      crosswind.lat,
      crosswind.lon,
      0.5 * baseDistance,
      baseBearing + 180 - crabAngle
    )
    const crabLineLatLngs = [crosswind, crabBearingCoord]
    crabLine.setLatLngs(crabLineLatLngs)
  } else {
    const finalDistance =
      baseHeight * glideRatio * (1 - windSpeed / canopySpeed)
    const finalBearing = windBearing + 180

    const baseDistance =
      (finalHeight - baseHeight) *
      glideRatio *
      (Math.sqrt(canopySpeed ** 2 + windSpeed ** 2) / canopySpeed)
    const baseBearing =
      finalBearing + 180 - (Math.atan(canopySpeed / windSpeed) * 180) / Math.PI

    const downWindDistance =
      (holdingHeight - finalHeight) *
      glideRatio *
      ((windSpeed + canopySpeed) / canopySpeed)
    const downWindBearing = windBearing

    const latlngs = landingPattern.getLatLngs()
    latlngs[0] = marker.getLatLng()
    const downWind = calculateDestination(
      latlngs[0].lat,
      latlngs[0].lng,
      finalDistance,
      finalBearing
    )
    latlngs[1].lat = downWind.lat
    latlngs[1].lng = downWind.lon
    const crosswind = calculateDestination(
      latlngs[1].lat,
      latlngs[1].lng,
      baseDistance,
      baseBearing
    )
    latlngs[2].lat = crosswind.lat
    latlngs[2].lng = crosswind.lon
    const upwind = calculateDestination(
      latlngs[2].lat,
      latlngs[2].lng,
      downWindDistance,
      downWindBearing
    )
    latlngs[3].lat = upwind.lat
    latlngs[3].lng = upwind.lon
    landingPattern.setLatLngs(latlngs)

    const crabAngle = (
      90 -
      (Math.atan(canopySpeed / windSpeed) * 180) / Math.PI
    ).toFixed(2)

    document.getElementById('crab_angle').textContent = crabAngle

    const crabBearingCoord = calculateDestination(
      crosswind.lat,
      crosswind.lon,
      0.5 * baseDistance,
      baseBearing + 180 - crabAngle
    )
    const crabLineLatLngs = [crosswind, crabBearingCoord]
    crabLine.setLatLngs(crabLineLatLngs)
  }
}

map.on('click', onMapClick)
onMapClick({
  latlng: [52.8906, -0.905659]
})
