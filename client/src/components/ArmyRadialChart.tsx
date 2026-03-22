import React, { useState } from 'react';
import { Text } from '@mantine/core';
import { ArmyDistribution } from '../utils/statisticsUtils';

interface FactionDef {
  name: string;
  color: string;
  subfactions: string[];
}

// Main factions only — subfaction lists will be updated with full details
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

const describeArc = (
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

/** Single-arc path at a given radius for textPath labels */
const describeTextArc = (
  cx: number, cy: number,
  r: number,
  startAngle: number, endAngle: number,
): string => {
  const s = polarToCartesian(cx, cy, r, startAngle);
  const e = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
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
  isVanilla: boolean;
}

interface FactionLayout {
  name: string;
  color: string;
  total: number;
  startAngle: number;
  endAngle: number;
  spokes: SpokeLayout[];
}

const CX = 450;
const CY = 450;
const CENTER_R = 70;
const INNER_R1 = 82;
const INNER_R2 = 160;
const BAR_START = 175;
const BAR_MAX = 340;
const LABEL_OFFSET = 10;
const GAP_DEG = 2.5;

const ArmyRadialChart: React.FC<Props> = ({ armyDistribution, totalPlayers }) => {
  const [hoveredFaction, setHoveredFaction] = useState<string | null>(null);

  const countMap = new Map(armyDistribution.map((a) => [a.army, a.count]));

  const factionData = FACTION_HIERARCHY.map((f) => {
    const subfactions = f.subfactions.map((name) => ({
      name,
      count: countMap.get(name) ?? 0,
    }));
    const total = subfactions.reduce((sum, s) => sum + s.count, 0);
    return { ...f, subfactions, total };
  }).filter((f) => f.total > 0);

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

  const usableDeg = 360 - factionData.length * GAP_DEG;
  const maxSubCount = Math.max(
    ...factionData.flatMap((f) => f.subfactions.map((s) => s.count)),
    1,
  );

  let currentAngle = 0;
  const layouts: FactionLayout[] = factionData.map((faction) => {
    const arcSpan = (faction.total / grandTotal) * usableDeg;
    const startAngle = currentAngle;
    const endAngle = currentAngle + arcSpan;

    const activeSubs = faction.subfactions.filter((s) => s.count > 0);
    const spokeCount = activeSubs.length;
    const spokeSpacing = spokeCount > 0 ? arcSpan / spokeCount : 0;

    const spokes: SpokeLayout[] = activeSubs.map((sub, i) => {
      const angle = startAngle + spokeSpacing * (i + 0.5);
      const barLength = (sub.count / maxSubCount) * (BAR_MAX - BAR_START);
      return {
        name: sub.name,
        count: sub.count,
        angle,
        barEnd: BAR_START + barLength,
        isVanilla: sub.name === faction.name,
      };
    });

    currentAngle = endAngle + GAP_DEG;
    return { name: faction.name, color: faction.color, total: faction.total, startAngle, endAngle, spokes };
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
      style={{ width: '100%', maxWidth: 850, height: 'auto', display: 'block', margin: '0 auto' }}
      aria-label="Army distribution sunburst chart"
    >
      <rect x="0" y="0" width="900" height="900" fill="#0f172a" rx="12" />

      {/* Guide rings */}
      {[INNER_R2, BAR_START, (BAR_START + BAR_MAX) / 2, BAR_MAX].map((r) => (
        <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="#1e293b" strokeWidth={0.5} />
      ))}

      {/* Inner ring: faction arcs */}
      {layouts.map((faction) => (
        <path
          key={`arc-${faction.name}`}
          d={describeArc(CX, CY, INNER_R1, INNER_R2, faction.startAngle, faction.endAngle)}
          fill={faction.color}
          opacity={hoveredFaction && hoveredFaction !== faction.name ? 0.2 : 1}
          stroke="white"
          strokeWidth={1.5}
          style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
          onMouseEnter={() => setHoveredFaction(faction.name)}
          onMouseLeave={() => setHoveredFaction(null)}
        />
      ))}

      {/* Inner ring: curved faction labels */}
      <defs>
        {layouts.map((faction, idx) => {
          const arcSpan = faction.endAngle - faction.startAngle;
          if (arcSpan < 8) return null;
          const labelR = (INNER_R1 + INNER_R2) / 2;
          const midAngle = (faction.startAngle + faction.endAngle) / 2;
          const svgAngle = midAngle - 90;
          const normalized = ((svgAngle % 360) + 360) % 360;
          const isFlipped = normalized > 90 && normalized < 270;
          // For flipped arcs, draw the path in reverse so text reads correctly
          return isFlipped ? (
            <path
              key={`tp-${idx}`}
              id={`arc-text-${idx}`}
              d={describeTextArc(CX, CY, labelR, faction.endAngle, faction.startAngle + 360)}
            />
          ) : (
            <path
              key={`tp-${idx}`}
              id={`arc-text-${idx}`}
              d={describeTextArc(CX, CY, labelR, faction.startAngle, faction.endAngle)}
            />
          );
        })}
      </defs>
      {layouts.map((faction, idx) => {
        const arcSpan = faction.endAngle - faction.startAngle;
        if (arcSpan < 8) return null;
        return (
          <text
            key={`arc-label-${faction.name}`}
            fill="white"
            fontSize={arcSpan > 30 ? 13 : arcSpan > 18 ? 11 : 9}
            fontWeight={700}
            style={{ pointerEvents: 'none' }}
          >
            <textPath
              href={`#arc-text-${idx}`}
              startOffset="50%"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {faction.name}
            </textPath>
          </text>
        );
      })}

      {/* Outer spokes: subfaction bars and labels */}
      {layouts.flatMap((faction) =>
        faction.spokes.map((spoke) => {
          const innerEdge = polarToCartesian(CX, CY, INNER_R2, spoke.angle);
          const start = polarToCartesian(CX, CY, BAR_START, spoke.angle);
          const end = polarToCartesian(CX, CY, spoke.barEnd, spoke.angle);
          const labelPos = polarToCartesian(CX, CY, spoke.barEnd + LABEL_OFFSET, spoke.angle);
          const { isFlipped, rotation } = getLabelTransform(spoke.angle);
          const isDimmed = !!hoveredFaction && hoveredFaction !== faction.name;

          return (
            <g
              key={spoke.name}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredFaction(faction.name)}
              onMouseLeave={() => setHoveredFaction(null)}
            >
              {/* Thin connector from inner ring to bar start */}
              <line
                x1={innerEdge.x} y1={innerEdge.y}
                x2={start.x} y2={start.y}
                stroke={faction.color}
                strokeWidth={0.5}
                opacity={isDimmed ? 0.08 : 0.3}
                style={{ transition: 'opacity 0.2s' }}
              />
              {/* Bar segment */}
              <line
                x1={start.x} y1={start.y}
                x2={end.x} y2={end.y}
                stroke={faction.color}
                strokeWidth={spoke.isVanilla ? 8 : 5}
                strokeLinecap="round"
                opacity={isDimmed ? 0.1 : 0.85}
                style={{ transition: 'opacity 0.2s' }}
              />
              {/* End cap */}
              <circle
                cx={end.x} cy={end.y}
                r={spoke.isVanilla ? 4.5 : 3}
                fill={faction.color}
                opacity={isDimmed ? 0.1 : 1}
                style={{ transition: 'opacity 0.2s' }}
              />
              {/* Label */}
              <text
                x={labelPos.x}
                y={labelPos.y}
                textAnchor={isFlipped ? 'end' : 'start'}
                dominantBaseline="middle"
                fill={isDimmed ? '#334155' : spoke.isVanilla ? '#f1f5f9' : '#cbd5e1'}
                fontSize={spoke.isVanilla ? 13 : 11}
                fontWeight={spoke.isVanilla ? 700 : 400}
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
      <text x={CX} y={CY - 8} textAnchor="middle" fill="#f1f5f9" fontSize={30} fontWeight="bold">
        {totalPlayers}
      </text>
      <text
        x={CX}
        y={CY + 18}
        textAnchor="middle"
        fill="#64748b"
        fontSize={11}
        style={{ letterSpacing: '0.12em' }}
      >
        PLAYERS
      </text>
    </svg>
  );
};

export default ArmyRadialChart;
