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
      if (el.src) element.adj.push(el.src)
      if (el.tgt) element.adj.push(el.tgt)
    }
    return element
  })
}