import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { Department } from '@/services/api';
import DepartmentPopup from '@/components/DepartmentPopup';
import { useEffect } from 'react';

interface RoutingProps {
  from?: L.LatLngExpression;
  to?: L.LatLngExpression;
}

const RoutingMachine = ({ from, to }: RoutingProps) => {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const routing: any = (L as any).Routing;
    const control = routing.control({
      waypoints: [L.latLng(from as any), L.latLng(to as any)],
      router: routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        profile: 'foot',
      }),
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    return () => {
      // @ts-ignore
      if (control) map.removeControl(control);
    };
  }, [from, to, map]);

  return null;
};

interface CollegeMapProps {
  departments: Department[];
  onMarkerClick: (dept: Department) => void;
  fromId?: string;
  toId?: string;
  onSetFrom: (id: string) => void;
  onSetTo: (id: string) => void;
  onViewStaff: (id: string) => void;
}

const CollegeMap = ({ departments, onMarkerClick, fromId, toId, onSetFrom, onSetTo, onViewStaff }: CollegeMapProps) => {
  const center: [number, number] = [departments[0]?.lat || 11.2749, departments[0]?.lng || 77.6099];

  const from = departments.find(d => d.id === fromId);
  const to = departments.find(d => d.id === toId);

  return (
    <MapContainer center={center} zoom={16} scrollWheelZoom={true} className="h-[68vh] md:h-[72vh] lg:h-[76vh] rounded-lg border">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {departments.map((dept) => (
        <Marker key={dept.id} position={[dept.lat, dept.lng]} eventHandlers={{ click: () => onMarkerClick(dept) }}>
          <Popup>
            <DepartmentPopup
              department={dept}
              onViewStaff={onViewStaff}
              onSetAsFrom={onSetFrom}
              onSetAsTo={onSetTo}
            />
          </Popup>
        </Marker>
      ))}

      {from && to && (
        <RoutingMachine from={[from.lat, from.lng]} to={[to.lat, to.lng]} />
      )}
    </MapContainer>
  );
};

export default CollegeMap;
