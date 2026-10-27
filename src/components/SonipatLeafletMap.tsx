import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RefreshCw, Database } from 'lucide-react';
import { MasterIncidentTicket } from '../services/deduplicationEngine';
import { AppLanguage, AppTheme, tr, translateTerm } from '../services/uiPreferences';

interface SonipatLeafletMapProps {
  tickets: MasterIncidentTicket[];
  selectedTicketId: string;
  onSelectTicket: (ticketId: string) => void;
  onOpenVisualAudit: (ticketId: string) => void;
  onRefreshSupabaseIncidents?: () => void;
  isFetchingSupabase?: boolean;
  lastSyncedAt?: string;
  activeChaosPulse?: number;
  theme: AppTheme;
  lang: AppLanguage;
}

/**
 * Live Interactive Leaflet.js Map Component centered on Sonipat/NCR
 * Uses standard free OpenStreetMap tiles (https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png).
 */
export const SonipatLeafletMap: React.FC<SonipatLeafletMapProps> = ({
  tickets,
  selectedTicketId,
  onSelectTicket,
  onOpenVisualAudit,
  onRefreshSupabaseIncidents,
  isFetchingSupabase = false,
  lastSyncedAt,
  activeChaosPulse,
  lang,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  const activeTicket =
    tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  // Initialize Leaflet Map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = activeTicket ? activeTicket.lat : 28.9931;
    const initialLng = activeTicket ? activeTicket.lng : 77.0151;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    const tileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    tileLayerRef.current = tileLayer;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  // Render glowing GPS incident pins fetched from Supabase `incidents` table + 200m clustering radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    selectedMarkerRef.current = null;

    tickets.forEach((ticket) => {
      const isSelected = ticket.id === selectedTicketId;
      const isEscalated =
        ticket.status === 'REOPENED_ESCALATED' ||
        ticket.status === 'SLA_BREACH_ESCALATED' ||
        ticket.escrowStatus === 'FROZEN_FRAUD_DETECTED';
      const isVerified = ticket.status === 'VERIFIED_CLOSED';

      const pinColor = isEscalated
        ? '#FF2A85'
        : isVerified
          ? '#10B981'
          : isSelected
            ? '#00F5D4'
            : '#FFB703';

      // Draw 200m Spatial Deduplication Radius Circle around each Master Incident
      L.circle([ticket.lat, ticket.lng], {
        radius: 200,
        color: pinColor,
        weight: isSelected ? 2.5 : 1.5,
        opacity: isSelected ? 0.9 : 0.45,
        fillColor: pinColor,
        fillOpacity: isSelected ? 0.14 : 0.05,
        dashArray: isSelected ? '6, 4' : undefined,
      }).addTo(group);

      // For the currently selected ticket, plot all duplicate citizen reports inside the 200m circle
      if (isSelected) {
        ticket.mergedReports.forEach((rep) => {
          const citizenDot = L.circleMarker([rep.lat, rep.lng], {
            radius: 5,
            color: '#070B14',
            weight: 1.5,
            fillColor: '#FFB703',
            fillOpacity: 0.95,
          });

          citizenDot.bindTooltip(
            `<div style="font-size:11px;font-weight:700;">${rep.citizenName} (${rep.distanceFromCentroidMeters}m)</div>
             <div style="font-size:10px;opacity:0.85;">${lang === 'hi' ? rep.rawTextHi : rep.rawText}</div>`,
            { direction: 'top', offset: [0, -6] }
          );

          citizenDot.addTo(group);

          // Connecting line from duplicate citizen report to Master Centroid
          L.polyline(
            [
              [rep.lat, rep.lng],
              [ticket.lat, ticket.lng],
            ],
            {
              color: pinColor,
              weight: 1,
              opacity: 0.45,
              dashArray: '3, 3',
            }
          ).addTo(group);
        });
      }

      // Custom Glowing HTML GPS Pin
      const glowingIcon = L.divIcon({
        className: 'aether-custom-gps-pin',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -18],
        html: `
          <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            <span class="aether-pin-pulse" style="position:absolute;width:38px;height:38px;border-radius:9999px;background:${pinColor};opacity:0.45;"></span>
            <span style="position:relative;width:${isSelected ? '22px' : '16px'};height:${isSelected ? '22px' : '16px'};border-radius:9999px;background:${pinColor};border:3px solid #070B14;box-shadow:0 0 18px ${pinColor};display:flex;align-items:center;justify-content:center;">
              <span style="width:6px;height:6px;border-radius:9999px;background:#FFFFFF;"></span>
            </span>
          </div>
        `,
      });

      const marker = L.marker([ticket.lat, ticket.lng], { icon: glowingIcon });

      const titleText =
        lang === 'hi' ? ticket.titleHi || ticket.title : ticket.title;
      const sectorText =
        lang === 'hi' ? ticket.sectorHi || ticket.sector : ticket.sector;

      const popupContainer = document.createElement('div');
      popupContainer.style.minWidth = '235px';
      popupContainer.style.padding = '4px';
      popupContainer.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <span style="font-family:monospace;font-weight:800;font-size:11px;color:${pinColor};">
            ${ticket.id} · ${translateTerm(lang, ticket.status)}
          </span>
          <span style="font-family:monospace;font-weight:800;font-size:11px;padding:2px 6px;border-radius:6px;background:rgba(255,42,133,0.15);color:#FF2A85;">
            ${tr(lang, 'Urgency', 'गंभीरता')}: ${ticket.urgencyScore}/100
          </span>
        </div>
        <div style="font-weight:700;font-size:13px;line-height:1.35;margin-bottom:4px;">
          ${titleText}
        </div>
        <div style="font-size:11px;opacity:0.8;margin-bottom:8px;">
          📍 ${sectorText} · ${ticket.lat.toFixed(4)}°N, ${ticket.lng.toFixed(4)}°E
        </div>
        <div style="font-size:11px;font-family:monospace;margin-bottom:10px;padding:6px;border-radius:8px;background:rgba(148,163,184,0.12);">
          <div>• ${ticket.duplicateCount} ${tr(lang, 'Reports Merged (200m)', 'शिकायतें जुड़ीं (200m)')}</div>
          <div>• ${tr(lang, 'Trust', 'भरोसा')}: ${ticket.contractorTrustScore}% · ₹${ticket.escrowValueINR.toLocaleString('en-IN')} (${translateTerm(lang, ticket.escrowStatus)})</div>
        </div>
        <button id="audit-btn-${ticket.id}" style="width:100%;padding:7px 10px;border-radius:8px;background:#00F5D4;color:#070B14;font-weight:800;font-size:11px;border:none;cursor:pointer;">
          📸 ${tr(lang, 'Open AI Visual Lie-Detector →', 'AI फोटो जांच खोलें →')}
        </button>
      `;

      marker.bindPopup(popupContainer);

      marker.on('click', () => {
        onSelectTicket(ticket.id);
      });

      marker.on('popupopen', () => {
        const btn = popupContainer.querySelector(`#audit-btn-${ticket.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onOpenVisualAudit(ticket.id);
          });
        }
      });

      marker.addTo(group);

      if (isSelected) {
        selectedMarkerRef.current = marker;
      }
    });
  }, [tickets, selectedTicketId, lang, onSelectTicket, onOpenVisualAudit]);

  // Smoothly fly to selected incident coordinates when selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeTicket) return;
    map.flyTo([activeTicket.lat, activeTicket.lng], 15, {
      duration: 0.85,
    });
  }, [activeTicket?.id, activeTicket?.lat, activeTicket?.lng]);

  // Open the active marker popup automatically when a Quick Judge Test button is pressed
  useEffect(() => {
    if (activeChaosPulse && selectedMarkerRef.current) {
      selectedMarkerRef.current.openPopup();
    }
  }, [activeChaosPulse]);

  return (
    <div className="relative w-full h-80 rounded-xl overflow-hidden border-2 border-theme shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom-Left Supabase `public.incidents` Live Fetch Bar */}
      <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={onRefreshSupabaseIncidents}
          className="civic-btn civic-card px-3 py-1.5 text-[11px] font-mono font-bold text-teal-600 dark:text-[#00F5D4] flex items-center gap-1.5 shadow-lg"
        >
          <Database className="w-3.5 h-3.5" />
          <span>
            public.incidents ({tickets.length} {tr(lang, 'pins', 'पिन')})
          </span>
          <RefreshCw
            className={`w-3 h-3 ml-1 ${isFetchingSupabase ? 'animate-spin' : ''}`}
          />
        </button>
        {lastSyncedAt && (
          <span className="civic-card px-2.5 py-1 text-[10px] font-mono text-theme-secondary">
            {tr(lang, 'Synced', 'सिंक')}: {lastSyncedAt}
          </span>
        )}
      </div>

      {/* Floating Top-Right GPS Legend Overlay */}
      <div className="absolute top-3 right-3 z-[400] civic-card px-3 py-2 text-[11px] font-mono backdrop-blur-md bg-opacity-90 pointer-events-none space-y-1">
        <div className="font-bold text-teal-600 dark:text-[#00F5D4]">
          🛰️ {tr(lang, 'SONIPAT LIVE LEAFLET GIS', 'सोनीपत लाइव GPS मैप')}
        </div>
        <div className="flex items-center gap-2 text-theme-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4] inline-block" />
          <span>{tr(lang, 'Active Incident Pin', 'सक्रिय घटना पिन')}</span>
        </div>
        <div className="flex items-center gap-2 text-theme-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB703] inline-block" />
          <span>{tr(lang, '200m Cluster Reports', '200m क्लस्टर शिकायतें')}</span>
        </div>
      </div>
    </div>
  );
};
