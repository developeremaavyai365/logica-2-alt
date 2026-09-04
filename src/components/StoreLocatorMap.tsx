import { useEffect, useState } from 'react';
import { offices } from '../data';

interface StatePath {
  name: string;
  d: string;
}

// Precisely projected (geoMercator, fit to mainland India) marker positions
// for each office city, matching the 300x340 viewBox of /data/india-states.json.
const MARKER_POS: Record<string, { x: number; y: number }> = {
  Delhi: { x: 93.1, y: 99.9 },
  Mumbai: { x: 48.6, y: 207.2 },
  Kolkata: { x: 207.6, y: 168.8 },
  Hyderabad: { x: 106.2, y: 225.5 },
  Bangalore: { x: 97, y: 272.5 },
};

const MARKER_COLOR: Record<string, string> = {
  Delhi: '#E23744',
  Mumbai: '#1E88E5',
  Kolkata: '#43A047',
  Hyderabad: '#8E24AA',
  Bangalore: '#FB8C00',
};

// A small rotating palette of deep, saturated jewel tones so the landmass
// reads clearly against the white section background — office markers sit
// on top in even brighter, fully-saturated colors so they still pop.
const STATE_PALETTE = [
  '#1B4B91', '#0F766E', '#7C2D92', '#B45309', '#1E3A8A', '#065F46',
  '#6D28D9', '#9D174D', '#155E75', '#3730A3',
];

function stateColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return STATE_PALETTE[hash % STATE_PALETTE.length];
}

export default function StoreLocatorMap() {
  const [states, setStates] = useState<StatePath[] | null>(null);

  useEffect(() => {
    fetch('/data/india-states.json')
      .then((res) => res.json())
      .then(setStates)
      .catch(() => setStates([]));
  }, []);

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-5xl text-center">
        <h2
          className="font-dm-sans font-medium text-black"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.04em' }}
        >
          Our Registered Offices
        </h2>
        <p className="font-inter mt-3 text-sm text-black/60 sm:text-base" style={{ letterSpacing: '-0.01em' }}>
          Five offices across India, backing a nationwide retail and distribution network.
        </p>
      </div>

      <div className="mx-auto mt-12 w-full max-w-2xl">
        <svg
          viewBox="0 0 300 340"
          className="w-full"
          role="img"
          aria-label="State-wise map of India showing Logica Infoway office locations in Delhi, Mumbai, Kolkata, Hyderabad and Bangalore"
        >
          {states?.map((s) => (
            <path
              key={s.name}
              d={s.d}
              fill={stateColor(s.name)}
              stroke="#ffffff"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          ))}

          {offices.map((office) => {
            const pos = MARKER_POS[office.city];
            if (!pos) return null;
            const color = MARKER_COLOR[office.city] ?? '#000000';
            return (
              <g key={office.city} transform={`translate(${pos.x} ${pos.y})`}>
                <circle r="10" fill={color} opacity="0.2" className="animate-ping-slow" />
                <circle r="5.5" fill={color} stroke="#ffffff" strokeWidth="1.5" />
                <text
                  x="10"
                  y="4"
                  className="font-inter"
                  fontSize="11"
                  fontWeight="600"
                  fill="#14161A"
                  style={{ paintOrder: 'stroke' }}
                  stroke="#ffffff"
                  strokeWidth="3"
                >
                  {office.city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
