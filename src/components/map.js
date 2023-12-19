import { useRef, useState, useEffect } from "react";
import geoData from "../data/o_cho_dua.json"
import L from 'leaflet'
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet'

function Map() {
  //Marker position
  const [markerA, setMarkerA] = useState(null)
  const [markerB, setMarkerB] = useState(null)
  //Marker class object
  const [mkA, setMkA] = useState(null)
  const [mkB, setMkB] = useState(null)

  function MyComponent() {
    const map = useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        let text = ''
        if (!markerA) {
          text = 'A'
          setMarkerA([lat, lng])
        }
        else if (!markerB) {
          text = 'B'
          setMarkerB([lat, lng])
        }
        else {
          setMarkerA(null)
          setMarkerB(null)
          map.removeLayer(mkA)
          map.removeLayer(mkB)
          return
        }
        const newMarker = L.marker(e.latlng, {
          draggable: true,
          icon: L.divIcon({
            iconSize: 'auto',
            className: 'icon-marker',
            html: `<div class="marker-text">${text}</div>`
          })
        }).addTo(map)

        if (text == 'A') setMkA(newMarker)
        if (text == 'B') setMkB(newMarker)
      }
    });
    return null;
  }

  return (
    <MapContainer center={([21.0224683, 105.8203064])} zoom={15}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png">
      </TileLayer>
      <MyComponent/>
    </MapContainer>
  );
}

export default Map