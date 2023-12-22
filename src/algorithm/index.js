import geoDataParsed from '../data/o_cho_dua_new.json'
import { minifyGeoJSON } from '../utils'

export const findPath = async (startPoint, endPoint, functionType = 'dijkstra') => {
  const data = minifyGeoJSON(geoDataParsed)

  switch (functionType) {
    case 'astar': {
      return initAstar(startPoint, endPoint, data)
    }
    case 'dijkstra': {
      return initDijkstra(startPoint, endPoint, data)
    }
  }
  
  return
}

function getWeightBetweenPoints(A, B) {
  const x = Math.abs(A[0] - B[0])
  const y = Math.abs(A[1] - B[1])

  return Math.sqrt(x*x + y*y)
}

async function initAstar(startID, endID, data) {
  const points = data.filter(el => el.type == "Point")
  const edges = data.filter(el => el.type != "Point")

  const start = points.find(el => el.id == startID)
  const end = points.find(el => el.id == endID)

  const costMap = new Map();
  const startWeight = getWeightBetweenPoints(start.coordinates, end.coordinates);
  costMap.set(start.id, {
    path: [],
    pointPath: [start],
    pointData: start,
    weight: startWeight
  });

  return astar(start, end, points, edges, costMap, [], [start.id])
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
    const costResult = costMap.get(end.id)
    costResult.weight = costResult.weight + costResult.path[costResult.path.length - 1].weight
    return {
      pointUsed: [...pointPool, ...removedPoint],
      data: costResult
    }
  }

  // Fallback error, case search all and case no more point to search
  if (pointPool.length + removedPoint.length >= points.length || !pointPool.length) {
    console.log("There're no path")
    return
  }

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
  
  pointPool = pointPool.filter(e => e != minNode.id)
  removedPoint.push(minNode.id)
  const nextPoint = costMap.get(minNode.id).pointData
  return await astar(nextPoint, end, points, edges, costMap, pointPool, removedPoint)
}

async function initDijkstra(startID, endID, data) {
  const points = data.filter(el => el.type == "Point")
  const edges = data.filter(el => el.type != "Point")

  const start = points.find(el => el.id == startID)
  const end = points.find(el => el.id == endID)
  const costMap = new Map();
  const startWeight = 0;
  costMap.set(start.id, {
    path: [],
    pointPath: [start],
    pointData: start,
    weight: startWeight
  });
  return dijkstra(start, end, points, edges, costMap, [], [])
}

async function dijkstra(cur, end, points, edges, costMap, queue, removedPoint) {
  const connectedLine = edges.filter(ed => ed.src == cur.id || ed.tgt == cur.id)
  const costCur = costMap.get(cur.id)
  for (let i = 0; i < connectedLine.length; i++) {
    const line = connectedLine[i]
    const connectedPointId = line.src == cur.id ? line.tgt : line.src
    const connectedPoint = points.find(p => p.id == connectedPointId)
    const newCost = {
      path: [...costCur.path, line],
      pointPath: [...costCur.pointPath, connectedPoint],
      pointData: connectedPoint,
      weight: costCur.weight + line.weight
    }
    //If point already checked
    if (removedPoint.includes(connectedPointId) || queue.find(el => el.id == connectedPointId)) {
      const oldCost = costMap.get(connectedPointId)
      if (!oldCost) {
        console.log('old')
      }
      if (!oldCost || (oldCost && oldCost.weight > newCost.weight)) {
        costMap.set(connectedPointId, newCost)
      }
      continue
    }
    costMap.set(connectedPointId, newCost)
    queue.push(connectedPoint)
  }

  if (queue.find(el => el.id == end.id)) {
    console.log('found dijkstra')
    return {
      pointUsed: [...queue.map(el => el.id), ...removedPoint],
      data: costMap.get(end.id)
    }
  }

  if (!queue.length) {
    console.log('dijkstra no path found')
    return
  }

  //find next point with smallest weight
  removedPoint.push(cur.id)
  const smallest = {
    point: null,
    weight: Infinity
  }

  for(let i = 0; i < queue.length; i++) {
    const cost = costMap.get(queue[i].id)
    if (cost.weight < smallest.weight) {
      smallest.point = cost.pointData
      smallest.weight = cost.weight
    }
  }

  queue = queue.filter(el => el.id != smallest.point.id)

  return dijkstra(smallest.point, end, points, edges, costMap, queue, removedPoint)
}