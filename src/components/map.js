import { useRef, useState, useEffect } from "react";
import geoData from "../data/o_cho_dua.json"

function Map() {
  const mapContainer = useRef();
  const [map, setMap] = useState({});

  useEffect(()=>{
    const L = window.L
    const map = L.map(mapContainer.current, {attributionControl: false}).setView([21.0224683, 105.8203064], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    console.log("map data", geoData)

    // unmount map function
    return () => map.remove();
  }, []);

  return (
      <div style={{padding: 0, margin: 0, width: "100%", height: "100vh",}}
            ref={el => mapContainer.current = el}>
      </div>
  );
}

export default Map