export const getSquareDistance = (nodeA, nodeB) => {
  const latA = nodeA.lat * 1e3
  const latB = nodeB.lat * 1e3
  const lngA = nodeA.lng * 1e3
  const lngB = nodeB.lng * 1e3

  return (Math.pow(latA - latB, 2) + Math.pow(lngA - lngB, 2)) / 1e6
}