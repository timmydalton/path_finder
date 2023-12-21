import geoDataParsed from '../data/o_cho_dua_new.json'
import { minifyGeoJSON } from '../utils'

export const findPath = async (startPoint, endPoint, functionType = 'dijkstra') => {
  const data = minifyGeoJSON(geoDataParsed)

  const points = data.filter(el => el.type == "Point")
  const edges = data.filter(el => el.type != "Point")

  const start = points.find(el => el.id == startPoint)
  const end = points.find(el => el.id == endPoint)

  switch (functionType) {
    case 'astar': {
      const costMap = new Map()
      const startWeight = getWeightBetweenPoints(start.coordinates, end.coordinates)
      costMap.set(start.id, {
        path: [],
        pointPath: [start],
        pointData: start,
        weight: startWeight
      })
      return astar(start, end, points, edges, costMap, [], [start.id])
    }
  }
  
  return
}

function getWeightBetweenPoints(A, B) {
  const x = Math.abs(A[0] - B[0])
  const y = Math.abs(A[1] - B[1])

  return Math.sqrt(x*x + y*y)
}

async function astar(cur, end, points, edges, costMap, pointPool, removedPoint) {
  const connectedLine = edges.filter(ed => ed.src == cur.id || ed.tgt == cur.id)
  const costData = costMap.get(cur.id)
  for (let i = 0; i < connectedLine.length; i++) {
    const line = connectedLine[i]
    const connectedPointId = line.src == cur.id ? line.tgt : line.src
    // If point checked return
    if (pointPool.includes(connectedPointId)) continue
    const connectedPoint = points.find(p => p.id == connectedPointId)
    const lineWeight = costData.path.reduce((a, c) => a + c.weight, 0)
    const directWeight = getWeightBetweenPoints(connectedPoint.coordinates, end.coordinates)
    let newCostData = {
      path: [...costData.path, line],
      pointPath: [...costData.pointPath, connectedPoint],
      pointData: connectedPoint,
      weight: directWeight + lineWeight
    }
    if (removedPoint.includes(connectedPointId)) {
      const oldCostData = costMap.get(connectedPointId)
      if (oldCostData.weight < newCostData.weight) continue
    }

    pointPool.push(connectedPointId)
    costMap.set(connectedPointId, newCostData)
  }

  // If checked end point return
  if (pointPool.includes(end.id)) {
    console.log('found astar')
    return {
      pointUsed: [...pointPool, ...removedPoint],
      data: costMap.get(end.id)
    }
  }

  // Fallback error
  if (pointPool.length + removedPoint.length >= points.length) return

  // Find next smallest weight in pointPool
  let minNode = {
    id: null,
    weight: Infinity
  }
  for (let i = 0; i < pointPool.length; i++) {
    const pID = pointPool[i]
    const pointCost = costMap.get(pID)
    if (pointCost.weight < minNode.weight) {
      minNode = {
        id: pID,
        weight: pointCost.weight
      }
    }
  }

  // Case not connected
  if (!minNode.id) return
  
  pointPool = pointPool.filter(e => e != minNode.id)
  removedPoint.push(minNode.id)
  const nextPoint = costMap.get(minNode.id).pointData
  return await astar(nextPoint, end, points, edges, costMap, pointPool, removedPoint)
}