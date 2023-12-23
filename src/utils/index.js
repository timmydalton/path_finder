export const getDistance = (nodeA, nodeB) => {
  const latA = degrees_to_radians(nodeA.lat)
  const latB = degrees_to_radians(nodeB.lat)
  const lngA = degrees_to_radians(nodeA.lng)
  const lngB = degrees_to_radians(nodeB.lng)

  const x = Math.abs(latA - latB)
  const y = Math.abs(lngA - lngB)
  const val = Math.pow(Math.sin(x/2), 2) + Math.cos(latA)*Math.cos(latB)*Math.pow(Math.sin(y/2), 2)

  return 6378.8 * (2 * Math.asin(Math.sqrt(val)));
}

export function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

export const minifyGeoJSON = (data) => {
  return data.features.map(el => {
    const element = {
      id: el.id,
      type: el.geometry.type,
      coordinates: el.geometry.coordinates,
    }

    if (el.src || el.tgt) {
      element.adj = []
      if (el.src) element.src = el.src
      if (el.tgt) element.tgt = el.tgt
    }

    if (element.type == 'LineString') {
      let weight = 0
      const coor = element.coordinates
      for (let i = 0; i < coor.length - 1; i++) {
        weight += getDistance({lng: coor[i][0], lat: coor[i][1]}, {lng: coor[i+1][0], lat: coor[i+1][1]})
      }

      element.weight = weight
    }

    return element
  })
}