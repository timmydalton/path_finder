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
    
    let text = ''

    function onMapClick(e) {
      let text = ''
      if (!window.markerA) text = 'A'
      else if (!window.markerB) text = 'B'
      else {
        map.removeLayer(window.markerA)
        map.removeLayer(window.markerB)
        window.markerA = null
        window.markerB = null
        return
      }

      console.log(e.latlng)

      const newMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          iconSize: 'auto',
          className: 'icon-marker',
          html: `<div class="marker-text">${text}</div>`
        })
      }).addTo(map)

      if (text == 'A') window.markerA = newMarker
      if (text == 'B') window.markerB = newMarker
    }

    map.on('click', onMapClick)

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