import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export const BRASILIA: [number, number] = [-15.7939, -47.8828]

/** Com token Mapbox, usa tiles Mapbox; sem token, usa OpenStreetMap. A leitura do mapa é privada (só /admin). */
function tileLayer() {
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined
  return token
    ? L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${token}`, { tileSize: 512, zoomOffset: -1, maxZoom: 19, attribution: '© Mapbox © OpenStreetMap' })
    : L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' })
}
const pin = (color: string) => L.divIcon({
  className: '', iconSize: [26, 34], iconAnchor: [13, 34], popupAnchor: [0, -30],
  html: `<svg width="26" height="34" viewBox="0 0 26 34"><path d="M13 0C5.8 0 0 5.8 0 13c0 9.5 13 21 13 21s13-11.5 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/><circle cx="13" cy="13" r="5" fill="#fff"/></svg>`,
})

function useMap(ref: React.RefObject<HTMLDivElement | null>) {
  const map = useRef<L.Map | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const m = L.map(ref.current, { center: BRASILIA, zoom: 11 })
    tileLayer().addTo(m)
    map.current = m
    return () => { m.remove(); map.current = null }
  }, [ref])
  return map
}

export function MapPicker({ value, onChange }: { value: { lat: number; lng: number } | null; onChange: (v: { lat: number; lng: number }) => void }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useMap(el)
  const marker = useRef<L.Marker | null>(null)
  const cb = useRef(onChange); cb.current = onChange
  useEffect(() => {
    const m = map.current; if (!m) return
    const place = (lat: number, lng: number) => {
      if (!marker.current) {
        marker.current = L.marker([lat, lng], { draggable: true, icon: pin('#008eea') }).addTo(m)
        marker.current.on('dragend', () => { const p = marker.current!.getLatLng(); cb.current({ lat: p.lat, lng: p.lng }) })
      } else marker.current.setLatLng([lat, lng])
    }
    m.on('click', (e: L.LeafletMouseEvent) => { place(e.latlng.lat, e.latlng.lng); cb.current({ lat: e.latlng.lat, lng: e.latlng.lng }) })
    if (value) { place(value.lat, value.lng); m.setView([value.lat, value.lng], 16) }
    setTimeout(() => m.invalidateSize(), 150)
    return () => { m.off('click'); marker.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map])
  useEffect(() => {
    const m = map.current
    if (m && value && marker.current) { marker.current.setLatLng([value.lat, value.lng]); m.setView([value.lat, value.lng], Math.max(m.getZoom(), 16)) }
    else if (m && value && !marker.current) { marker.current = L.marker([value.lat, value.lng], { draggable: true, icon: pin('#008eea') }).addTo(m); m.setView([value.lat, value.lng], 16) }
  }, [value?.lat, value?.lng, map]) // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={el} className="h-72 w-full rounded-lg border border-slate-300" role="application" aria-label="Mapa para posicionar o pino da visita" />
}

export type MapPoint = { id: string; lat: number; lng: number; lines: string[] }
export function PinsMap({ points }: { points: MapPoint[] }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useMap(el)
  useEffect(() => {
    const m = map.current; if (!m) return
    const group = L.featureGroup().addTo(m)
    for (const p of points) {
      const box = document.createElement('div')
      p.lines.forEach((t, i) => { const d = document.createElement(i === 0 ? 'strong' : 'div'); d.textContent = t; box.appendChild(d) }) // textContent: sem HTML injetado
      L.marker([p.lat, p.lng], { icon: pin('#082b5c') }).bindPopup(box).addTo(group)
    }
    if (points.length) m.fitBounds(group.getBounds().pad(0.3), { maxZoom: 15 })
    setTimeout(() => m.invalidateSize(), 150)
    return () => { group.remove() }
  }, [points, map])
  return <div ref={el} className="h-[28rem] w-full rounded-xl border border-silver" role="application" aria-label="Mapa de visitas realizadas" />
}
