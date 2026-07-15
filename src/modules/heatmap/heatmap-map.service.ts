import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';
import { ScanDto } from '../dashboard/dashboard.dto';

@Injectable({ providedIn: 'root' })
export class HeatmapMapService {
  private map!: L.Map;

  initMap(containerId: string): void {
    const cleanView = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; CartoDB' });
    const detailedTerrain = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { attribution: '&copy; Google Maps', maxZoom: 20 });

    this.map = L.map(containerId, {
      center: [7.7512, 125.7231],
      zoom: 12,
      zoomControl: false,
      layers: [detailedTerrain]
    });

    L.control.layers({ "Detailed Terrain": detailedTerrain, "Clean View": cleanView }, {}, { position: 'bottomleft' }).addTo(this.map);
    this.drawBoundary();
  }

  destroyMap(): void {
    if (this.map) this.map.remove();
  }

  recenter(): void {
    if (this.map) this.map.setView([7.7512, 125.7231], 12);
  }

  clearScanLayers(): void {
    if (!this.map) return;
    this.map.eachLayer((layer) => {
      if (layer instanceof (L as any).HeatLayer || layer instanceof L.CircleMarker) {
        if (!layer.getPopup()?.getContent()?.toString().includes('Target Area')) {
          this.map.removeLayer(layer);
        }
      }
    });
  }

  plotMarkers(scans: ScanDto[], onMarkerClick: (scan: ScanDto) => void): void {
    this.clearScanLayers();
    const heatPoints: any[] = [];
    const validScans = scans.filter(s => s.location_lat && s.location_lng);

    validScans.forEach(scan => {
      const lat = Number(scan.location_lat);
      const lng = Number(scan.location_lng);
      const diseaseKey = (scan.disease_key || '').toLowerCase().replace(/[-_\s]/g, '');
      const severity = (scan.severity_key || 'mild').toLowerCase();

      let intensity = 0.4;
      if (severity === 'severe') intensity = 1.0;
      else if (severity === 'moderate') intensity = 0.65;
      else if (severity === 'mild') intensity = 0.3;

      heatPoints.push([lat, lng, intensity, diseaseKey, severity]);
      this.addClickableMarker(lat, lng, scan, onMarkerClick);
    });

    this.renderHeatLayers(heatPoints);
  }

  focusOnLocation(lat: number, lng: number): void {
    if (!this.map) return;
    this.map.flyTo([lat, lng], 16, { animate: true, duration: 2.0 });

    const highlightIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute w-12 h-12 bg-green-500 rounded-full animate-ping opacity-20"></div>
               <div class="w-8 h-8 bg-white border-4 border-green-600 rounded-full shadow-2xl relative z-10"></div>
             </div>`,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });

    L.marker([lat, lng], { icon: highlightIcon }).addTo(this.map)
      .bindPopup(`<b class="text-slate-800">Target Area</b>`).openPopup();
  }

  private renderHeatLayers(heatPoints: any[]): void {
    const healthyPoints = heatPoints
      .filter(p => p[2] !== undefined && (p[3] as string).includes('healthy'))
      .map(p => [p[0], p[1], p[2]]);

    if (healthyPoints.length) {
      (L as any).heatLayer(healthyPoints, {
        radius: 50, blur: 25, max: 1.0, minOpacity: 0.45,
        gradient: { 0.2: '#bbf7d0', 0.5: '#4ade80', 0.8: '#16a34a', 1.0: '#14532d' }
      }).addTo(this.map);
    }

    const mealybugPoints = heatPoints
      .filter(p => (p[3] as string).includes('mealybug'))
      .map(p => [p[0], p[1], p[2]]);

    if (mealybugPoints.length) {
      (L as any).heatLayer(mealybugPoints, {
        radius: 50, blur: 25, max: 1.0, minOpacity: 0.45,
        gradient: { 0.2: '#bfdbfe', 0.5: '#3b82f6', 0.8: '#1d4ed8', 1.0: '#1e3a8a' }
      }).addTo(this.map);
    }

    const getSeverityWeight = (p: any[]): number => {
      const severityStr = p[4] as string;
      if (severityStr === 'severe') return 1.0;
      if (severityStr === 'moderate') return 0.6;
      if (severityStr === 'mild') return 0.25;
      return typeof p[2] === 'number' ? p[2] : 0.5;
    };

    const blackPodPoints = heatPoints
      .filter(p => (p[3] as string).includes('blackpod'))
      .map(p => {
        const lat = p[0];
        const lng = p[1];
        const weight = getSeverityWeight(p);
        return [lat, lng, weight];
      });

    if (blackPodPoints.length) {
      (L as any).heatLayer(blackPodPoints, {
        radius: 50, blur: 25, max: 1.0, minOpacity: 0.40,
        gradient: {
          0.25: '#fca5a5',
          0.60: '#ef4444',
          1.00: '#7f1d1d'
        }
      }).addTo(this.map);
    }

    const podBorerPoints = heatPoints
      .filter(p => (p[3] as string).includes('podborer'))
      .map(p => [p[0], p[1], p[2]]);

    if (podBorerPoints.length) {
      (L as any).heatLayer(podBorerPoints, {
        radius: 50, blur: 25, max: 1.0, minOpacity: 0.45,
        gradient: { 0.2: '#FFFBA7', 0.5: '#FFEA6C', 0.8: '#eab308', 1.0: '#FFCC00' }
      }).addTo(this.map);
    }

    const otherPoints = heatPoints
      .filter(p => {
        const d = p[3] as string;
        return !d.includes('healthy')
          && !d.includes('mealybug')
          && !d.includes('blackpod')
          && !d.includes('podborer');
      })
      .map(p => [p[0], p[1], p[2]]);

    if (otherPoints.length) {
      (L as any).heatLayer(otherPoints, {
        radius: 50, blur: 25, max: 1.0, minOpacity: 0.45,
        gradient: { 0.2: '#bfdbfe', 0.5: '#3b82f6', 0.8: '#1d4ed8', 1.0: '#1e3a8a' }
      }).addTo(this.map);
    }
  }

  private addClickableMarker(lat: number, lng: number, scan: ScanDto, onClick: (scan: ScanDto) => void): void {
    const ghostMarker = L.circleMarker([lat, lng], { radius: 20, stroke: false, fillColor: '#000', fillOpacity: 0 }).addTo(this.map);

    ghostMarker.bindTooltip(`<div style="font-size:11px;font-weight:700;padding:2px 4px;white-space:nowrap;">${scan.user_name || 'Unknown'} &nbsp;·&nbsp; ${scan.disease_key || '—'}</div>`, { sticky: true, direction: 'top' });
    ghostMarker.on('click', () => onClick(scan));
    ghostMarker.on('mouseover', (e) => (e.target as L.CircleMarker).setStyle({ fillOpacity: 0.08, fillColor: '#1e293b' }));
    ghostMarker.on('mouseout', (e) => (e.target as L.CircleMarker).setStyle({ fillOpacity: 0 }));
  }

  private drawBoundary(): void {
    const boundaryCoords: L.LatLngTuple[] = [
      [7.806560861082189, 125.63986102045375],
      [7.7956762095560865, 125.63196459707926],
      [7.794995909431882, 125.66320696782175],
      [7.741929100320352, 125.64020434320918],
      [7.743630063488939, 125.68655291518975],
      [7.722537635330425, 125.67693987803823],
      [7.68608165649672, 125.68385925522492],
      [7.671187109483628, 125.70077199774289],
      [7.680133924592561, 125.7221384442543],
      [7.66464738677233, 125.72361706165712],
      [7.6526771983407205, 125.74031302153712],
      [7.652043473116281, 125.7484123382937],
      [7.683939805531676, 125.76134282642398],
      [7.682813265212966, 125.77782564636436],
      [7.691332653669563, 125.78493031018593],
      [7.7033721590568724, 125.77945971904207],
      [7.70808359287765, 125.77164314928795],
      [7.727444436605209, 125.76759349090968],
      [7.741435502048624, 125.75246835983998],
      [7.752139988193796, 125.73589958976596],
      [7.763325284000295, 125.72782762483625],
      [7.811671196718009, 125.72624964672997],
      [7.827604881331258, 125.70919534486183],
      [7.823215663004752, 125.70694976062417],
      [7.830551043241702, 125.69462939311539],
      [7.842360795049566, 125.66801254185408],
      [7.823328174293252, 125.63906132053842],
      [7.808920959985727, 125.64199646739989]
    ];

    L.polygon(boundaryCoords, {
      color: '#dc2626',
      weight: 5,
      fillColor: '#000',
      fillOpacity: 0.05,
      interactive: false
    }).addTo(this.map);
    L.polygon(boundaryCoords, {
      color: '#ffffff',
      weight: 5,
      dashArray: '10, 15',
      fill: false,
      interactive: false
    }).addTo(this.map);
  }
}
