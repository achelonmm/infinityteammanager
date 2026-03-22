import React, { useState } from 'react';
import { Text } from '@mantine/core';
import { ArmyDistribution } from '../utils/statisticsUtils';

interface FactionDef {
  name: string;
  color: string;
  subfactions: string[];
}

const FACTION_HIERARCHY: FactionDef[] = [
  {
    name: 'PanOceania',
    color: '#3b82f6',
    subfactions: ['PanOceania', 'Acontecimiento', 'Órdenes Militares', 'Neoterra', 'Varuna', 'WinterFor', 'Kestrel'],
  },
  {
    name: 'Yu Jing',
    color: '#f97316',
    subfactions: ['Yu Jing', 'Ejército Invencible', 'Servicio Imperial', 'Estandarte Blanco'],
  },
  {
    name: 'Ariadna',
    color: '#22c55e',
    subfactions: ['Ariadna', 'Caledonia', 'Merovingia', 'USAriadna', 'Tartary Army Corps', 'Kosmoflot'],
  },
  {
    name: 'Haqqislam',
    color: '#d4a853',
    subfactions: ['Haqqislam', 'Hassassin Bahram', 'Qapu Khalqi', 'Ramah Taskforce'],
  },
  {
    name: 'Nómadas',
    color: '#f87171',
    subfactions: ['Nómadas', 'Corregidor', 'Tunguska', 'Bakunin'],
  },
  {
    name: 'Ejército Combinado',
    color: '#1e3a5f',
    subfactions: ['Ejército Combinado', 'Morat', 'Shasvastii', 'Ónice', 'Next Wave'],
  },
  {
    name: 'ALEPH',
    color: '#94a3b8',
    subfactions: ['ALEPH', 'Falange de Acero', 'SSO'],
  },
  {
    name: 'Tohaa',
    color: '#86efac',
    subfactions: ['Tohaa'],
  },
  {
    name: 'JSA',
    color: '#991b1b',
    subfactions: ['JSA', 'Shindenbutai', 'Oban'],
  },
  {
    name: 'O-12',
    color: '#7c3aed',
    subfactions: ['O-12', 'Starmada', 'Torchlight'],
  },
  {
    name: 'Ejércitos No Alineados',
    color: '#78350f',
    subfactions: ['Druze Bayram Security', 'Ikari Company', 'StarCo', 'WhiteCo', 'Dashat Company'],
  },
];

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/** Stroke-only arc path at a single radius (clockwise) */
const describeStrokeArc = (
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number,
): string => {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

/** Same arc but drawn in reverse direction (for readable textPath on the left side) */
const describeStrokeArcReversed = (
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number,
): string => {
  const s = polarToCartesian(cx, cy, r, endAngle);
  const e = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
};

/** Filled arc (ring segment) between two radii */
const describeFilledArc = (
  cx: number, cy: number,
  r1: number, r2: number,
  startAngle: number, endAngle: number,
): string => {
  const s1 = polarToCartesian(cx, cy, r1, startAngle);
  const e1 = polarToCartesian(cx, cy, r1, endAngle);
  const s2 = polarToCartesian(cx, cy, r2, endAngle);
  const e2 = polarToCartesian(cx, cy, r2, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s1.x} ${s1.y}`,
    `A ${r1} ${r1} 0 ${large} 1 ${e1.x} ${e1.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${r2} ${r2} 0 ${large} 0 ${e2.x} ${e2.y}`,
    'Z',
  ].join(' ');
};

interface Props {
  armyDistribution: ArmyDistribution[];
  totalPlayers: number;
}

interface SpokeLayout {
  name: string;
  count: number;
  angle: number;
  barEnd: number;
}

interface FactionLayout {
  name: string;
  color: string;
  total: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  arcOuter: number;
  barStart: number;
  spokes: SpokeLayout[];
}

const CX = 450;
const CY = 450;
const CENTER_R = 60;
const FACTION_LABEL_R = 155;
const ARC_R_INNER = 170;
const ARC_R_MAX_THICKNESS = 35;
const ARC_BAR_GAP = 10;
const BAR_MAX = 320;
const GAP_DEG = 9;

/** Short display names for the curved inner-ring labels */
const ARC_LABEL_NAMES: Record<string, string> = {
  'PanOceania': 'PanO',
  'Ejércitos No Alineados': 'NA2',
  'Ejército Combinado': 'EC',
};

const ArmyRadialChart: React.FC<Props> = ({ armyDistribution, totalPlayers }) => {
  const [hoveredFaction, setHoveredFaction] = useState<string | null>(null);

  const countMap = new Map(armyDistribution.map((a) => [a.army, a.count]));

  // Always show all factions (even with 0 total) so the chart is complete
  const factionData = FACTION_HIERARCHY.map((f) => {
    const subfactions = f.subfactions.map((name) => ({
      name,
      count: countMap.get(name) ?? 0,
    }));
    const total = subfactions.reduce((sum, s) => sum + s.count, 0);
    return { ...f, subfactions, total };
  });

  // Collect unmatched armies into an "Other" group
  const matched = new Set(FACTION_HIERARCHY.flatMap((f) => f.subfactions));
  const unmatched = armyDistribution.filter((a) => !matched.has(a.army) && a.count > 0);
  if (unmatched.length > 0) {
    factionData.push({
      name: 'Other',
      color: '#64748b',
      subfactions: unmatched.map((a) => ({ name: a.army, count: a.count })),
      total: unmatched.reduce((s, a) => s + a.count, 0),
    });
  }

  const grandTotal = factionData.reduce((s, f) => s + f.total, 0);

  if (grandTotal === 0) {
    return <Text c="dimmed">No army data available yet.</Text>;
  }

  // Total number of subfaction spokes across all factions
  const totalSpokes = factionData.reduce((s, f) => s + f.subfactions.length, 0);
  const totalGapDeg = factionData.length * GAP_DEG;
  const usableDeg = 360 - totalGapDeg;
  // Each spoke gets an equal angular slice; faction span = numSubfactions * spokeAngle
  const spokeAngle = usableDeg / totalSpokes;

  const maxSubCount = Math.max(
    ...factionData.flatMap((f) => f.subfactions.map((s) => s.count)),
    1,
  );
  const maxFactionTotal = Math.max(...factionData.map((f) => f.total), 1);

  let currentAngle = 0;
  const layouts: FactionLayout[] = factionData.map((faction) => {
    const numSubs = faction.subfactions.length;
    const factionSpan = numSubs * spokeAngle;
    const startAngle = currentAngle;
    const endAngle = currentAngle + factionSpan;
    const midAngle = (startAngle + endAngle) / 2;

    // Arc thickness proportional to faction total players
    const arcThickness = Math.max(
      (faction.total / maxFactionTotal) * ARC_R_MAX_THICKNESS,
      2, // minimum visible thickness
    );
    const arcOuter = ARC_R_INNER + arcThickness;
    const barStart = arcOuter + ARC_BAR_GAP;

    const spokes: SpokeLayout[] = faction.subfactions.map((sub, i) => {
      const angle = startAngle + spokeAngle * (i + 0.5);
      const barLength = sub.count > 0
        ? (sub.count / maxSubCount) * (BAR_MAX - barStart)
        : 0;
      return {
        name: sub.name,
        count: sub.count,
        angle,
        barEnd: barStart + barLength,
      };
    });

    currentAngle = endAngle + GAP_DEG;
    return { name: faction.name, color: faction.color, total: faction.total, startAngle, endAngle, midAngle, arcOuter, barStart, spokes };
  });

  const getLabelTransform = (angleDeg: number) => {
    const svgAngle = angleDeg - 90;
    const normalized = ((svgAngle % 360) + 360) % 360;
    const isFlipped = normalized > 90 && normalized < 270;
    return { isFlipped, rotation: isFlipped ? svgAngle + 180 : svgAngle };
  };

  return (
    <svg
      viewBox="0 0 900 900"
      style={{ width: '100%', maxWidth: 900, height: 'auto', display: 'block', margin: '0 auto' }}
      aria-label="Army distribution sunburst chart"
    >
      <rect x="0" y="0" width="900" height="900" fill="#0f172a" rx="12" />

      {/* Colored arc per faction — thickness proportional to total players */}
      {layouts.map((faction) => (
        <path
          key={`arc-${faction.name}`}
          d={describeFilledArc(CX, CY, ARC_R_INNER, faction.arcOuter, faction.startAngle, faction.endAngle)}
          fill={faction.color}
          opacity={hoveredFaction && hoveredFaction !== faction.name ? 0.15 : 0.9}
          stroke="#0f172a"
          strokeWidth={1}
          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={() => setHoveredFaction(faction.name)}
          onMouseLeave={() => setHoveredFaction(null)}
        />
      ))}

      {/* Curved faction name labels following the arc */}
      <defs>
        {layouts.map((faction, idx) => {
          // Flip text for the bottom half so it always reads left-to-right
          const isFlipped = faction.midAngle >= 90 && faction.midAngle <= 270;
          return (
            <path
              key={`tp-${idx}`}
              id={`faction-arc-${idx}`}
              d={isFlipped
                ? describeStrokeArcReversed(CX, CY, FACTION_LABEL_R, faction.startAngle, faction.endAngle)
                : describeStrokeArc(CX, CY, FACTION_LABEL_R, faction.startAngle, faction.endAngle)
              }
            />
          );
        })}
      </defs>
      {layouts.map((faction, idx) => {
        const isDimmed = !!hoveredFaction && hoveredFaction !== faction.name;
        const displayName = ARC_LABEL_NAMES[faction.name] ?? faction.name;
        const arcSpan = faction.endAngle - faction.startAngle;

        // For very small arcs (e.g. Tohaa with 1 subfaction), use horizontal text
        if (arcSpan < 10) {
          const pos = polarToCartesian(CX, CY, FACTION_LABEL_R, faction.midAngle);
          return (
            <text
              key={`fl-${faction.name}`}
              x={pos.x + 10}
              y={pos.y}
              textAnchor="start"
              dominantBaseline="middle"
              fill={isDimmed ? '#334155' : '#f1f5f9'}
              fontSize={10}
              fontWeight={700}
              style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
            >
              {displayName} ({faction.total})
            </text>
          );
        }

        return (
          <text
            key={`fl-${faction.name}`}
            fill={isDimmed ? '#334155' : '#f1f5f9'}
            fontSize={10}
            fontWeight={700}
            style={{ pointerEvents: 'none', transition: 'fill 0.2s' }}
          >
            <textPath
              href={`#faction-arc-${idx}`}
              startOffset="50%"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {displayName} ({faction.total})
            </textPath>
          </text>
        );
      })}

      {/* Subfaction bars and labels */}
      {layouts.flatMap((faction) =>
        faction.spokes.map((spoke) => {
          const barStart = polarToCartesian(CX, CY, faction.barStart, spoke.angle);
          const barEnd = polarToCartesian(CX, CY, spoke.barEnd, spoke.angle);
          // Label sits right after the bar tip, or right after the arc if no bar
          const labelAnchorR = spoke.count > 0 ? spoke.barEnd + 8 : faction.arcOuter + 8;
          const labelPos = polarToCartesian(CX, CY, labelAnchorR, spoke.angle);
          const { isFlipped, rotation } = getLabelTransform(spoke.angle);
          const isDimmed = !!hoveredFaction && hoveredFaction !== faction.name;

          return (
            <g
              key={spoke.name}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredFaction(faction.name)}
              onMouseLeave={() => setHoveredFaction(null)}
            >
              {/* Colored bar (only if count > 0) */}
              {spoke.count > 0 && (
                <line
                  x1={barStart.x} y1={barStart.y}
                  x2={barEnd.x} y2={barEnd.y}
                  stroke={faction.color}
                  strokeWidth={6}
                  strokeLinecap="round"
                  opacity={isDimmed ? 0.1 : 0.9}
                  style={{ transition: 'opacity 0.2s' }}
                />
              )}
              {/* Subfaction label */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={isFlipped ? 'end' : 'start'}
                dominantBaseline="middle"
                fill={isDimmed ? '#1e293b' : spoke.count > 0 ? '#cbd5e1' : '#475569'}
                fontSize={11}
                fontWeight={400}
                transform={`rotate(${rotation}, ${labelPos.x}, ${labelPos.y})`}
                style={{ transition: 'fill 0.2s', pointerEvents: 'none' }}
              >
                {spoke.name} ({spoke.count})
              </text>
            </g>
          );
        }),
      )}

      {/* Center disc */}
      <circle cx={CX} cy={CY} r={CENTER_R} fill="#0b1120" stroke="#1e293b" strokeWidth={1.5} />
      <text x={CX} y={CY - 8} textAnchor="middle" fill="#f1f5f9" fontSize={28} fontWeight="bold">
        {totalPlayers}
      </text>
      <text
        x={CX}
        y={CY + 16}
        textAnchor="middle"
        fill="#64748b"
        fontSize={10}
        style={{ letterSpacing: '0.12em' }}
      >
        PLAYERS
      </text>
    </svg>
  );
};

export default ArmyRadialChart;
