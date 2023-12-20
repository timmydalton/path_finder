export const getDistance = (nodeA, nodeB) => {
  const latA = nodeA.lat
  const latB = nodeB.lat
  const lngA = nodeA.lng
  const lngB = nodeB.lng

  const x = Math.abs(latA - latB)
  const y = Math.abs(lngA - lngB)

  return Math.sqrt(x*x + y*y)
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