/* global GeographicLib, L, selectedCoords */

function calculateDestination (lat, lng, distance, bearing) {
  const geodesic = GeographicLib.Geodesic.WGS84
  const result = geodesic.Direct(lat, lng, bearing, distance * 0.3048)
  return {
    lat: result.lat2,
    lng: result.lon2
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
    const quadkey = this.toQuadKey(coords.x, coords.y, coords.z) // eslint-disable-line no-undef
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
  'https://t{s}.tiles.virtualearth.net/tiles/a{q}.jpeg?g=1398',
  {
    subdomains: ['0', '1', '2', '3', '4'],
    attribution: '&copy; <a href="https://bing.com/maps">Bing Maps</a>'
  }
)

const map = L.map(document.querySelector('#map'), {
  layers: [layer],
  center: selectedCoords,
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

const marker = L.marker(selectedCoords).addTo(map)

function onMapClick (e) {
  marker.setLatLng(e.latlng)
  updateLandingPattern()
}

function updateLandingPattern () {
  const windSpeedInput = document.getElementById('wind-speed')
  const windBearingInput = document.getElementById('wind-bearing')
  const rightHandPatternCheckbox =
    document.getElementById('right-hand-pattern')
  const calculateCrabAngleCheckbox = document.getElementById(
    'calculate-crab-angle'
  )
  const downWindHeightInput = document.getElementById('downwind-height')
  const baseHeightInput = document.getElementById('base-height')
  const finalHeightInput = document.getElementById('final-height')
  const canopySpeedInput = document.getElementById('canopy-speed')
  const glideRatioInput = document.getElementById('glide-ratio')

  const windSpeed = parseFloat(windSpeedInput.value) || 0
  const windBearing = parseFloat(windBearingInput.value) || 0
  const rightHandPattern = rightHandPatternCheckbox.checked
  const calculateCrabAngle = calculateCrabAngleCheckbox.checked
  const downWindHeight = parseInt(downWindHeightInput.value)
  const baseHeight = parseInt(baseHeightInput.value)
  const finalHeight = parseInt(finalHeightInput.value)
  const canopySpeed = parseFloat(canopySpeedInput.value) || 0
  const glideRatio = parseFloat(glideRatioInput.value) || 0

  const latlngs = landingPattern.getLatLngs()
  latlngs[0] = marker.getLatLng()
  const finalCoords = calculateFinal(
    latlngs[0],
    glideRatio,
    windSpeed,
    canopySpeed,
    windBearing,
    finalHeight
  )
  latlngs[1].lat = finalCoords.lat
  latlngs[1].lng = finalCoords.lng

  if (calculateCrabAngle) {
    const baseDistance =
      (baseHeight - finalHeight) *
      glideRatio *
      (Math.sqrt(canopySpeed ** 2 - windSpeed ** 2) / canopySpeed)
    const baseBearing = windBearing + 90 * (rightHandPattern ? -1 : 1) + 180

    const baseCoords = calculateDestination(
      latlngs[1].lat,
      latlngs[1].lng,
      baseDistance,
      baseBearing
    )
    latlngs[2].lat = baseCoords.lat
    latlngs[2].lng = baseCoords.lng

    const crabAngle = (
      (Math.asin(windSpeed / canopySpeed) * 180) /
      Math.PI
    ).toFixed(2)
    document.getElementById('crab-angle').textContent = crabAngle

    const crabBearingCoord = calculateDestination(
      baseCoords.lat,
      baseCoords.lng,
      0.5 * baseDistance,
      baseBearing + 180 - (rightHandPattern ? -1 : 1) * crabAngle
    )
    const crabLineLatLngs = [baseCoords, crabBearingCoord]
    crabLine.setLatLngs(crabLineLatLngs)
  } else {
    const baseDistance =
      (baseHeight - finalHeight) *
      glideRatio *
      (Math.sqrt(canopySpeed ** 2 + windSpeed ** 2) / canopySpeed)
    const baseBearing =
      windBearing +
      (rightHandPattern ? 1 : -1) *
        ((Math.atan(canopySpeed / windSpeed) * 180) / Math.PI)

    const crosswind = calculateDestination(
      latlngs[1].lat,
      latlngs[1].lng,
      baseDistance,
      baseBearing
    )
    latlngs[2].lat = crosswind.lat
    latlngs[2].lng = crosswind.lng

    const crabAngle = (
      90 -
      (Math.atan(canopySpeed / windSpeed) * 180) / Math.PI
    ).toFixed(2)

    document.getElementById('crab-angle').textContent = crabAngle

    const crabBearingCoord = calculateDestination(
      crosswind.lat,
      crosswind.lng,
      0.5 * baseDistance,
      baseBearing + 180 - (rightHandPattern ? -1 : 1) * crabAngle
    )
    const crabLineLatLngs = [crosswind, crabBearingCoord]
    crabLine.setLatLngs(crabLineLatLngs)
  }

  const downWindDistance =
    (downWindHeight - baseHeight) *
    glideRatio *
    ((windSpeed + canopySpeed) / canopySpeed)
  const downWindBearing = windBearing

  const downWindCoords = calculateDestination(
    latlngs[2].lat,
    latlngs[2].lng,
    downWindDistance,
    downWindBearing
  )
  latlngs[3].lat = downWindCoords.lat
  latlngs[3].lng = downWindCoords.lng
  landingPattern.setLatLngs(latlngs)
}

function calculateFinal (
  startPoint,
  glideRatio,
  windSpeed,
  canopySpeed,
  windBearing,
  finalHeight
) {
  const finalDistance =
    finalHeight * glideRatio * (1 - windSpeed / canopySpeed)
  const finalBearing = windBearing + 180
  const finalCoords = calculateDestination(
    startPoint.lat,
    startPoint.lng,
    finalDistance,
    finalBearing
  )
  return finalCoords
}

map.on('click', onMapClick)
onMapClick({
  latlng: [52.8906, -0.905659]
})
