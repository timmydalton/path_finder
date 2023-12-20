import geoDataParsed from '../data/o_cho_dua_new.json'

export const findPath = (startPoint, endPoint, functionType = 'dijkstra') => {
  const data = geoDataParsed.map(el => {
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

  console.log(data)

  let path = []
  return path
}