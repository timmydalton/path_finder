import { useEffect, useState, useRef } from "react";
import { LeafletMouseEvent, LatLng } from "leaflet";
import { Map, Marker, TileLayer, ZoomControl } from "react-leaflet";
import { markerA, markerB, nodeMarker } from "./Icons";
import { findPath } from "./algorithm";
import geoData from "./data/o_cho_dua.json"
import geoDataParsed from "./data/o_cho_dua_new.json"
import { getDistance, minifyGeoJSON } from "./utils";
import './App.css';

function App() {
  const mapContainer = useRef();

  // Algorithm
  const [al, setAl] = useState('dijkstra')

  // Map Init position
  const [lng, setLng] = useState(105.8203064);
  const [lat, setLat] = useState(21.0224683);
  const [zoom, setZoom] = useState(16);

  // start and end markers
  const [startNode, setStartNode] = useState(null); //string
  const [endNode, setEndNode] = useState(null); //string
  const [startMarkerPos, setStartMarkerPos] = useState(null); //LatLng
  const [endMarkerPos, setEndMarkerPos] = useState(null); //LatLng
  const startNodeMarker = useRef(null); //Marker
  const endNodeMarker = useRef(null); //Marker

  // pathfinding state
  const [pathFound, setPathFound] = useState(false); //Bool
  const [isRunning, setIsRunning] = useState(false); //Bool

  // final pathfinding path
  const [checkedNode, setCheckedNode] = useState([])
  const [path, setPath] = useState([]); //Array of LatLng

  // data
  const [geoData, setGeoData] = useState(minifyGeoJSON(geoDataParsed))

  // execution timing
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(0)

  const findClosestNode = (latlng) => {
    let closestNode = {
      id: null,
      weight: Infinity,
      coordinates: null
    }
    const pointData = geoData.filter(e => e.type == 'Point')

    const lat = latlng.lat;
    const lng = latlng.lng;

    pointData.forEach(p => {
      const [pLng, pLat] = p.coordinates
      const weight = getDistance({lat, lng}, {lat: pLat, lng: pLng})
      if (weight < closestNode.weight) {
        closestNode = {
          id: p.id,
          weight: weight,
          coordinates: p.coordinates
        }
      }
    })

    return {
      key: closestNode.id,
      lat: closestNode.coordinates[1],
      lng: closestNode.coordinates[0]
    };
  };

  const handleClick = (e) => {
    if (!startNode || !endNode) {
      const closest = findClosestNode(e.latlng);
      if (closest) {
        if (!startNode) {
          setStartNode(closest.key);
          setStartMarkerPos(new LatLng(closest.lat, closest.lng));
        } else {
          setEndNode(closest.key);
          setEndMarkerPos(new LatLng(closest.lat, closest.lng));
        }
      }
    }
  }
  
  const findPathCallBack = (data) => {
    switch(al) {
      case 'astar': {
        const checked = checkedNode
        if (checked.find(el => el.id == data.id)) return
        checked.push(data)
        setCheckedNode(checked)
        break
      }
    }
  }

  const clickFindPath = async (e) => {
    setCheckedNode([])
    setStartTime(Date.now())
    setIsRunning(true)
    const data = await findPath(startNode, endNode, al, findPathCallBack)
    setEndTime(Date.now())
    setIsRunning(false)
  }

  const changeAl = (e) => {
    setAl(e.target.value)
  }

  //Drag node
  const onStartNodeDrag = async (e) => {};

  const onEndNodeDrag = async (e) => {};

  // on finish drag, set position to nearest
  const onStartNodeDragEnd = (e) => {
    setCheckedNode([])
    const closest = findClosestNode(e.target._latlng);
    if (closest) {
      setStartNode(closest.key);
      setStartMarkerPos(new LatLng(closest.lat, closest.lng));
    }
  };

  const onEndNodeDragEnd = (e) => {
    setCheckedNode([])
    const closest = findClosestNode(e.target._latlng);
    if (closest) {
      setEndNode(closest.key);
      setEndMarkerPos(new LatLng(closest.lat, closest.lng));
    }
  };

  return (
    <div className="App">
      <Map
        preferCanvas
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={false}
        onClick={handleClick}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position={"bottomleft"} />

        { checkedNode &&
          checkedNode.map(node => {
            return (
              <Marker
                key={node.id}
                position={[node.coordinates[1], node.coordinates[0]]}
                icon={nodeMarker}
              />
            )
          })
        }

        {/* <PathfindingMarkers nodeData={nodeData} nodes={nodes} /> */}

        {/* Render start/end markers */}
        {startMarkerPos && (
          <Marker
            ref={startNodeMarker}
            position={[startMarkerPos.lat, startMarkerPos.lng]}
            icon={markerA}
            draggable
            ondrag={onStartNodeDrag}
            ondragend={onStartNodeDragEnd}
          />
        )}

        {endMarkerPos && (
          <Marker
            ref={endNodeMarker}
            position={[endMarkerPos.lat, endMarkerPos.lng]}
            icon={markerB}
            draggable
            ondragstart={() => {
              setPath([]);
            }}
            ondrag={onEndNodeDrag}
            ondragend={onEndNodeDragEnd}
          />
        )}

        {/* Render final path, if exists
        {/* {pathFound && path.length > 0 && (
          <AnimatedPolyline positions={path} snakeSpeed={300} />
        )} */}
      </Map>
      <div className={`trigger-btn ${!startMarkerPos || !endMarkerPos || isRunning ? 'disabled' : ''}`} onClick={clickFindPath}>
        Find Path
      </div>
      <div className="algorithm-container">
        <div>
          Algorithm:
          <select name="algorithm" onChange={changeAl} id="algorithm" value={al}>
            <option value="dijkstra">Dijkstra</option>
            <option value="astar">A*</option>
            <option value="bfs">BFS</option>
          </select>
        </div>
        <div>
          Execution time: {(endTime - startTime)/1e3}ms
        </div>
      </div>
    </div>
  );
}

export default App;
