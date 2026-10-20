"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { yeouidoPoint, yeouidoTone, type YeouidoPlace } from "@/lib/yeouido";

export function YeouidoMap({
  places,
  selectedId,
  onSelect,
}: {
  places: YeouidoPlace[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const groupRef = useRef<LayerGroup | null>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | null = null;

    (async () => {
      const L = (await import("leaflet")).default;
      if (disposed || !nodeRef.current || mapRef.current) return;
      map = L.map(nodeRef.current, { scrollWheelZoom: true }).setView(
        [37.526, 126.925],
        14,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      groupRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      window.setTimeout(() => map?.invalidateSize(), 80);
      if (!disposed) setReady(true);
    })();

    return () => {
      disposed = true;
      map?.remove();
      mapRef.current = null;
      groupRef.current = null;
      setReady(false);
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = groupRef.current;
    if (!ready || !map || !group) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled) return;
      group.clearLayers();
      const ids = places.map((place) => place.id);
      const bounds: [number, number][] = [];

      places.forEach((place, index) => {
        const point = yeouidoPoint(place.id, ids);
        if (!point) return;
        bounds.push([point.lat, point.lng]);
        const selected = place.id === selectedId;
        const icon = L.divIcon({
          className: "yeouido-pin-wrap",
          html: `<span class="yeouido-pin yeouido-pin--${yeouidoTone(place)}${selected ? " is-selected" : ""}">${String(index + 1).padStart(2, "0")}</span>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        const marker = L.marker([point.lat, point.lng], {
          icon,
          zIndexOffset: selected ? 800 : index,
        });
        marker.on("click", () => onSelectRef.current(place.id));
        marker.bindTooltip(place.name, { direction: "top", offset: [0, -14] });
        marker.addTo(group);
      });

      if (selectedId) {
        const point = yeouidoPoint(selectedId, ids);
        if (point) {
          map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 16), {
            duration: 0.35,
          });
        }
      } else if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 16);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [places, ready, selectedId]);

  return (
    <div ref={nodeRef} className="yeouido-map" role="region" aria-label="여의도 지도" />
  );
}
