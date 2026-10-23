import { Injectable } from '@angular/core';
import type * as LeafletType from 'leaflet';
import { Scan } from '../../app/shared/models';
import { DISEASE_SHADES, SeverityShades } from './heatmap.models';
import { inRing, loadPlaces, LatLon, Places } from './heatmap-places';

export type OverlayKey = 'barangays' | 'puroks';

/** Puroks are small, so their labels only appear once the map is zoomed in this far. */
const PUROK_MIN_ZOOM = 15;

const severityWeight = (p: any[]): number => {
  if (p[4] === 'severe') return 1.0;
  if (p[4] === 'moderate') return 0.6;
  return 0.25;
};

/** Flat colour bands (no blending between severities): weights 0.25 / 0.6 / 1.0 land in mild / moderate / severe. */
const bandedGradient = (c: SeverityShades): Record<number, string> => ({
  0: c.mild,
  0.4: c.mild,
  0.41: c.moderate,
  0.8: c.moderate,
  0.81: c.severe,
  1: c.severe,
});

const HEAT_GROUPS: {
  match: (d: string) => boolean;
  shades: SeverityShades;
  minOpacity: number;
  weight: (p: any[]) => number;
}[] = [
  {
    match: (d) => d.includes('healthy'),
    shades: DISEASE_SHADES.healthy,
    minOpacity: 0.45,
    weight: () => 0.6,
  },
  {
    match: (d) => d.includes('mealybug'),
    shades: DISEASE_SHADES.mealybug,
    minOpacity: 0.45,
    weight: severityWeight,
  },
  {
    match: (d) => d.includes('blackpod'),
    shades: DISEASE_SHADES.blackPod,
    minOpacity: 0.4,
    weight: severityWeight,
  },
  {
    match: (d) => d.includes('podborer'),
    shades: DISEASE_SHADES.podBorer,
    minOpacity: 0.45,
    weight: severityWeight,
  },
  {
    match: (d) => !['healthy', 'mealybug', 'blackpod', 'podborer'].some((k) => d.includes(k)),
    shades: DISEASE_SHADES.mealybug,
    minOpacity: 0.45,
    weight: severityWeight,
  },
];

@Injectable({ providedIn: 'root' })
export class HeatmapMapService {
  private map!: LeafletType.Map;
  private L!: typeof LeafletType;

  private readonly boundaryCoords: LeafletType.LatLngTuple[] = [
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
    [7.808920959985727, 125.64199646739989],
  ];

  private resizeObserver?: ResizeObserver;
  private mapReady?: Promise<void>;
  private heatLayers: any[] = [];
  private heatSyncBound = false;
  private heatFrame = 0;
  private overlayVisible: Record<OverlayKey, boolean> = { barangays: true, puroks: true };
  private places?: Places;
  private barangayLayer?: LeafletType.LayerGroup;
  private purokLayer?: LeafletType.LayerGroup;

  private async getLeaflet(): Promise<typeof LeafletType> {
    if (!this.L) {
      const leafletModule = await import('leaflet');
      this.L = (leafletModule as any).default || leafletModule;
      await import('leaflet.heat');
    }
    return this.L;
  }

  /** Scan plotting waits on this, so data that arrives before the map is built is not lost. */
  initMap(containerId: string): Promise<void> {
    this.mapReady = this.createMap(containerId);
    return this.mapReady;
  }

  private async createMap(containerId: string): Promise<void> {
    await this.getLeaflet();

    // OpenStreetMap's standard style: small roads, footpaths, buildings and place names.
    const streets = this.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    });

    const mapBounds = this.L.latLngBounds(this.boundaryCoords).pad(0.15);

    this.map = this.L.map(containerId, {
      center: [7.7512, 125.7231],
      zoom: 14,
      minZoom: 11,
      maxBounds: mapBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
      layers: [streets],
    });

    this.L.control.scale({ position: 'bottomleft', imperial: false }).addTo(this.map);
    this.L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.drawBoundary();
    this.observeResize(containerId);
    this.map.on('zoomend', () => this.syncOverlays());
    void this.loadPlaces();
  }

  setOverlay(key: OverlayKey, visible: boolean): void {
    this.overlayVisible[key] = visible;
    this.syncOverlays();
  }

  /** Fires when the user clicks empty map (a click on a scan spot does not count). */
  onMapClick(callback: () => void): void {
    this.map?.on('click', callback);
  }

  /** Draws barangay outlines and purok names, keeping only the parts inside the red boundary. */
  private async loadPlaces(): Promise<void> {
    const data = await loadPlaces();
    if (!this.map) return;
    this.places = data;

    const barangays = this.L.layerGroup();
    for (const b of data.barangays) {
      b.rings.forEach((ring) =>
        this.insideBoundary(ring).forEach((run) =>
          this.L.polyline(run, { color: '#334155', weight: 1.5, dashArray: '6 6', opacity: 0.8, interactive: false }).addTo(barangays),
        ),
      );
      this.addLabel(this.L.latLngBounds(b.rings.flat()).getCenter(), b.name, 'map-label-barangay', barangays);
    }

    const puroks = this.L.layerGroup();
    data.puroks.forEach((p) => this.addLabel([p.lat, p.lon], p.name, 'map-label-purok', puroks));

    this.barangayLayer = barangays;
    this.purokLayer = puroks;
    this.syncOverlays();
  }

  /** Splits an outline into the runs of vertices that lie inside the boundary. */
  private insideBoundary(ring: LatLon[]): LatLon[][] {
    const runs: LatLon[][] = [];
    let run: LatLon[] = [];
    for (const pt of ring) {
      if (inRing(pt[0], pt[1], this.boundaryCoords as LatLon[])) run.push(pt);
      else if (run.length) {
        runs.push(run);
        run = [];
      }
    }
    if (run.length) runs.push(run);
    return runs;
  }

  /** Zooms to the chosen barangay (or purok); with nothing chosen, back to the whole area. */
  showPlace(barangay: string | null, purok: string | null): void {
    if (!this.map || !this.places) return;
    const target = this.places.puroks.find((p) => p.name === purok && p.barangay === barangay);
    const area = this.places.barangays.find((b) => b.name === barangay);
    if (target) this.map.flyTo([target.lat, target.lon], 17, { duration: 1 });
    else if (area) this.map.flyToBounds(this.L.latLngBounds(area.rings.flat()), { padding: [24, 24], duration: 1 });
    else this.recenter();
  }

  private addLabel(at: LeafletType.LatLngExpression, name: string | undefined, cls: string, group: LeafletType.LayerGroup): void {
    if (!name) return;
    const span = document.createElement('span');
    span.className = `map-label ${cls}`;
    span.textContent = name;
    this.L.marker(at, {
      interactive: false,
      keyboard: false,
      icon: this.L.divIcon({ className: 'map-label-icon', html: span, iconSize: [0, 0] }),
    }).addTo(group);
  }

  private syncOverlays(): void {
    if (!this.map) return;
    const show = (layer: LeafletType.LayerGroup | undefined, on: boolean) => {
      if (!layer) return;
      if (on && !this.map.hasLayer(layer)) layer.addTo(this.map);
      else if (!on && this.map.hasLayer(layer)) this.map.removeLayer(layer);
    };
    show(this.barangayLayer, this.overlayVisible.barangays);
    show(this.purokLayer, this.overlayVisible.puroks && this.map.getZoom() >= PUROK_MIN_ZOOM);
  }

  /** Fires when the user starts dragging the map. */
  onDragStart(callback: () => void): void {
    this.map?.on('dragstart', callback);
  }

  private observeResize(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.map?.invalidateSize({ animate: false });
    });

    this.resizeObserver.observe(container);
  }

  destroyMap(): void {
    this.resizeObserver?.disconnect();
    if (this.heatFrame) cancelAnimationFrame(this.heatFrame);
    this.heatFrame = 0;
    this.heatLayers = [];
    this.heatSyncBound = false;
    this.barangayLayer = this.purokLayer = undefined;
    if (this.map) this.map.remove();
  }

  recenter(): void {
    if (this.map) this.map.setView([7.7512, 125.7231], 12);
  }

  async clearScanLayers(): Promise<void> {
    await this.mapReady;
    if (!this.map) return;
    await this.getLeaflet();

    this.heatLayers = [];
    this.map.eachLayer((layer) => {
      if (layer instanceof (this.L as any).HeatLayer || layer instanceof this.L.CircleMarker) {
        if (!layer.getPopup()?.getContent()?.toString().includes('Target Area')) {
          this.map.removeLayer(layer);
        }
      }
    });
  }

  async plotMarkers(scans: Scan[], onMarkerClick: (scan: Scan) => void): Promise<void> {
    await this.mapReady;
    if (!this.map) return;
    await this.getLeaflet();
    await this.clearScanLayers();

    const heatPoints: any[] = [];
    const validScans = scans.filter((s) => s.location_lat && s.location_lng);

    validScans.forEach((scan) => {
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

  async focusOnLocation(lat: number, lng: number): Promise<void> {
    await this.mapReady;
    if (!this.map) return;
    await this.getLeaflet();

    this.map.flyTo([lat, lng], 16, { animate: true, duration: 2.0 });

    const highlightIcon = this.L.divIcon({
      className: 'custom-div-icon',
      html: `<div class="w-6 h-6 bg-white border-4 border-green-600 rounded-full"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    this.L.marker([lat, lng], { icon: highlightIcon })
      .addTo(this.map)
      .bindPopup(`<b class="text-slate-800">Target Area</b>`)
      .openPopup();
  }

  /**
   * Heat colours are unchanged per disease. Each layer is registered so it can be
   * redrawn while the map moves (leaflet.heat only redraws on `moveend`, which made
   * the spots slide and clip at the canvas edge during a drag).
   */
  private renderHeatLayers(heatPoints: any[]): void {
    const radius = this.heatRadius();
    for (const g of HEAT_GROUPS) {
      const points = heatPoints
        .filter((p) => g.match(p[3] as string))
        .map((p) => [p[0], p[1], g.weight(p)]);
      if (!points.length) continue;

      const layer = (this.L as any)
        .heatLayer(points, { radius, blur: 25, max: 1.0, minOpacity: g.minOpacity, gradient: bandedGradient(g.shades) })
        .addTo(this.map);
      this.heatLayers.push(layer);
    }

    this.bindHeatSync();
  }

  /** Radius in px that scales with zoom so hotspots stay anchored to the ground. */
  private heatRadius(): number {
    const zoom = this.map.getZoom();
    return Math.max(14, Math.min(36, 14 + (zoom - 12) * 7));
  }

  private bindHeatSync(): void {
    if (this.heatSyncBound) return;
    this.heatSyncBound = true;

    this.map.on('move', () => {
      if (this.heatFrame) return;
      this.heatFrame = requestAnimationFrame(() => {
        this.heatFrame = 0;
        this.heatLayers.forEach((l) => l._reset?.());
      });
    });

    this.map.on('zoomend', () => {
      const radius = this.heatRadius();
      this.heatLayers.forEach((l) => l.setOptions({ radius }));
    });
  }

  private addClickableMarker(
    lat: number,
    lng: number,
    scan: Scan,
    onClick: (scan: Scan) => void,
  ): void {
    const diseaseKey = (scan.disease_key || '').toLowerCase().replace(/[-_\s]/g, '');
    const severity = (scan.severity_key || 'mild').toLowerCase() as keyof SeverityShades;
    const shades = HEAT_GROUPS.find((g) => g.match(diseaseKey))?.shades ?? DISEASE_SHADES.mealybug;
    const color = shades[severity] ?? shades.mild;

    this.L.circleMarker([lat, lng], {
      radius: 6,
      color: '#ffffff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.95,
      interactive: false,
    }).addTo(this.map);

    const hitArea = this.L.circleMarker([lat, lng], {
      radius: 16,
      stroke: false,
      fillOpacity: 0,
      bubblingMouseEvents: false,
    }).addTo(this.map);

    hitArea.bindTooltip(
      `<div style="font-size:11px;font-weight:600;padding:2px 4px;white-space:nowrap;">${scan.user_name || 'Unknown'} · ${scan.disease_key || '—'}</div>`,
      { sticky: true, direction: 'top' },
    );
    hitArea.on('click', () => onClick(scan));
  }

  private drawBoundary(): void {
    this.L.polygon(this.boundaryCoords, {
      color: '#dc2626',
      weight: 3,
      fillColor: '#000',
      fillOpacity: 0.03,
      interactive: false,
    }).addTo(this.map);
    this.L.polygon(this.boundaryCoords, {
      color: '#ffffff',
      weight: 3,
      dashArray: '8, 12',
      fill: false,
      interactive: false,
    }).addTo(this.map);
  }
}
