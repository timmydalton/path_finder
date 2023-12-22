import geoDataParsed from '../data/o_cho_dua_new.json'
import { minifyGeoJSON } from '../utils'

export const findPath = async (startPoint, endPoint, functionType = 'dijkstra') => {
  const data = minifyGeoJSON(geoDataParsed)

  const points = data.filter(el => el.type == "Point")
  const edges = data.filter(el => el.type != "Point")

  const start = points.find(el => el.id == startPoint)
  const end = points.find(el => el.id == endPoint)

  const costMap = new Map();
  const startWeight = getWeightBetweenPoints(start.coordinates, end.coordinates);
  costMap.set(start.id, {
    path: [],
    pointPath: [start],
    pointData: start,
    weight: startWeight
  });

  switch (functionType) {
    case 'astar': {
      return astar(start, end, points, edges, costMap, [], [start.id])
    }
    case 'dijkstra': {
      return dijkstra(start, end, points, edges, costMap, [], [start.id]);
    }
    case 'bfs': {
      return bfs(start, end, points, edges, costMap, [], [start.id]);
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

async function dijkstra(cur, end, points, edges, costMap, pointPool, removedPoint) {
  const connectedLines = edges.filter(ed => ed.src == cur.id || ed.tgt == cur.id);
  const costData = costMap.get(cur.id);

  for (let i = 0; i < connectedLines.length; i++) {
    const line = connectedLines[i];
    const connectedPointId = line.src == cur.id ? line.tgt : line.src;

    if (pointPool.includes(connectedPointId) || removedPoint.includes(connectedPointId)) continue;

    pointPool.push(connectedPointId);
    const connectedPoint = points.find(p => p.id == connectedPointId);
    const lineWeight = costData.path.reduce((a, c) => a + c.weight, 0);
    const newCostData = {
      path: [...costData.path, line],
      pointPath: [...costData.pointPath, connectedPoint],
      pointData: connectedPoint,
      weight: lineWeight + getWeightBetweenPoints(connectedPoint.coordinates, end.coordinates)
    };
    costMap.set(connectedPointId, newCostData);
  }

  if (pointPool.includes(end.id)) {
    console.log('found');
    return {
      pointUsed: [...pointPool, ...removedPoint],
      data: costMap.get(end.id)
    }
  }

  if (pointPool.length + removedPoint.length >= points.length) return;

  let minNode = {
    id: null,
    weight: Infinity
  };

  for (let i = 0; i < pointPool.length; i++) {
    const pID = pointPool[i];
    const pointCost = costMap.get(pID);

    if (pointCost.weight < minNode.weight) {
      minNode = {
        id: pID,
        weight: pointCost.weight
      };
    }
  }

  pointPool = pointPool.filter(e => e != minNode.id);
  removedPoint.push(minNode.id);
  const nextPoint = costMap.get(minNode.id).pointData;
  return dijkstra(nextPoint, end, points, edges, costMap, pointPool, removedPoint);
}

async function bfs(cur, end, points, edges, costMap, pointPool, removedPoint) {
  const connectedLines = edges.filter(ed => ed.src == cur.id || ed.tgt == cur.id);

  for (const line of connectedLines) {
    const connectedPointId = line.src == cur.id ? line.tgt : line.src;

    if (pointPool.includes(connectedPointId) || removedPoint.includes(connectedPointId)) continue;

    pointPool.push(connectedPointId);
    const connectedPoint = points.find(p => p.id == connectedPointId);
    const lineWeight = costMap.get(cur.id).path.reduce((a, c) => a + c.weight, 0);
    const newCostData = {
      path: [...costMap.get(cur.id).path, line],
      pointPath: [...costMap.get(cur.id).pointPath, connectedPoint],
      pointData: connectedPoint,
      weight: lineWeight + getWeightBetweenPoints(connectedPoint.coordinates, end.coordinates)
    };
    costMap.set(connectedPointId, newCostData);
  }

  if (pointPool.includes(end.id)) {
    console.log('found');
    return {
      pointUsed: [...pointPool, ...removedPoint],
      data: costMap.get(end.id)
    }
  }

  if (pointPool.length + removedPoint.length >= points.length) return;

  let minNode = {
    id: null,
    weight: Infinity
  };

  for (let i = 0; i < pointPool.length; i++) {
    const pID = pointPool[i];
    const pointCost = costMap.get(pID);

    if (pointCost.weight < minNode.weight) {
      minNode = {
        id: pID,
        weight: pointCost.weight
      };
    }
  }

  pointPool = pointPool.filter(e => e != minNode.id);
  removedPoint.push(minNode.id);
  const nextPoint = costMap.get(minNode.id).pointData;
  return bfs(nextPoint, end, points, edges, costMap, pointPool, removedPoint);
}