import { useEffect, useState, useRef } from "react";
import { LeafletMouseEvent, LatLng } from "leaflet";
import { Map, Marker, TileLayer, ZoomControl } from "react-leaflet";
import { markerA, markerB } from "./Icons";
import { findPath } from "./algorithm";
import geoData from "./data/o_cho_dua.json"
import geoDataParsed from "./data/o_cho_dua_new.json"
import './App.css';

function App() {
  const mapContainer = useRef();

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
  const [path, setPath] = useState([]); //Array of LatLng

  const findClosestNode = (latlng) => {
    const lat = latlng.lat;
    const lon = latlng.lng;
    return {
      key: `${lat}`,
      lat,
      lon
    };
  };

  const handleClick = (e) => {
    if (!startNode || !endNode) {
      const closest = findClosestNode(e.latlng);
      if (closest) {
        if (!startNode) {
          setStartNode(closest.key);
          setStartMarkerPos(new LatLng(closest.lat, closest.lon));
        } else {
          setEndNode(closest.key);
          setEndMarkerPos(new LatLng(closest.lat, closest.lon));
        }
      }
    }
  }

  //Drag node
  const onStartNodeDrag = async (e) => {};

  const onEndNodeDrag = async (e) => {};

  // on finish drag, set position to nearest
  const onStartNodeDragEnd = (e) => {
    const closest = findClosestNode(e.target._latlng);
    if (closest) {
      setStartNode(closest.key);
      setStartMarkerPos(new LatLng(closest.lat, closest.lon));
    }
  };

  const onEndNodeDragEnd = (e) => {
    const closest = findClosestNode(e.target._latlng);
    if (closest) {
      setEndNode(closest.key);
      setEndMarkerPos(new LatLng(closest.lat, closest.lon));
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
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <ZoomControl position={"bottomleft"} />

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
    </div>
  );
}

export default App;
