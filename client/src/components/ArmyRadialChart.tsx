import React, { useState } from 'react';
import { Text } from '@mantine/core';
import { ArmyDistribution } from '../utils/statisticsUtils';

const FACTION_HIERARCHY: Array<{ name: string; color: string; sectorials: string[] }> = [
  {
    name: 'PanOceania',
    color: '#3b82f6',
    sectorials: ['Acontecimiento', 'Órdenes Militares', 'Neoterra', 'Varuna', 'WinterFor', 'Kestrel'],
  },
  {
    name: 'Yu Jing',
    color: '#f97316',
    sectorials: ['Servicio Imperial', 'Ejército Invencible', 'Estandarte Blanco'],
  },
  {
    name: 'Ariadna',
    color: '#22c55e',
    sectorials: ['Caledonia', 'Merovingia', 'USAriadna', 'Tartary Army Corps', 'Kosmoflot'],
  },
  {
    name: 'Haqqislam',
    color: '#a3e635',
    sectorials: ['Hassassin Bahram', 'Qapu Khalqi', 'Ramah Taskforce'],
  },
  {
    name: 'Nómadas',
    color: '#e879f9',
    sectorials: ['Corregidor', 'Bakunin', 'Tunguska'],
  },
  {
    name: 'Ejército Combinado',
    color: '#818cf8',
    sectorials: ['Morat', 'Shasvastii', 'Ónice', 'Next Wave'],
  },
  {
    name: 'ALEPH',
    color: '#06b6d4',
    sectorials: ['Falange de Acero', 'SSO'],
  },
  {
    name: 'Tohaa',
    color: '#10b981',
    sectorials: [],
  },
  {
    name: 'O-12',
    color: '#f59e0b',
    sectorials: ['Starmada', 'Torchlight'],
  },
  {
    name: 'JSA',
    color: '#ec4899',
    sectorials: ['Shindenbutai', 'Oban'],
  },
  {
    name: 'NA2',
    color: '#94a3b8',
    sectorials: ['Druze Bayram Security', 'Ikari Company', 'StarCo', 'WhiteCo', 'Dashat Company'],
  },
];

interface SpokeEntry {
  army: string;
  count: number;
  color: string;
  isMain: boolean;
}

interface Props {
  armyDistribution: ArmyDistribution[];
  totalPlayers: number;
}

const ArmyRadialChart: React.FC<Props> = ({ armyDistribution, totalPlayers }) => {
  const [hoveredArmy, setHoveredArmy] = useState<string | null>(null);

  // Build ordered spokes: main faction then its sectorials
  const countMap = new Map(armyDistribution.map(a => [a.army, a.count]));
  const spokes: SpokeEntry[] = [];
  const added = new Set<string>();

  for (const faction of FACTION_HIERARCHY) {
    const mainCount = countMap.get(faction.name) ?? 0;
    const sectorItems = faction.sectorials.map(s => ({ s, c: countMap.get(s) ?? 0 }));
    if (mainCount === 0 && !sectorItems.some(x => x.c > 0)) continue;

    if (mainCount > 0) {
      spokes.push({ army: faction.name, count: mainCount, color: faction.color, isMain: true });
      added.add(faction.name);
    }
    for (const { s, c } of sectorItems) {
      if (c > 0) {
        spokes.push({ army: s, count: c, color: faction.color, isMain: false });
        added.add(s);
      }
    }
  }
  // Fallback: any army not in the hierarchy
  for (const { army, count } of armyDistribution) {
    if (!added.has(army) && count > 0) {
      spokes.push({ army, count, color: '#64748b', isMain: true });
    }
  }

  if (spokes.length === 0) {
    return <Text c="dimmed">No army data available yet.</Text>;
  }

  const CX = 400;
  const CY = 400;
  const INNER_R = 85;
  const MAX_R = 215;
  const LABEL_R = 262;
  const N = spokes.length;
  const maxCount = Math.max(...spokes.map(s => s.count), 1);

  return (
    <svg
      viewBox="0 0 800 800"
      style={{ width: '100%', height: 'auto', display: 'block' }}
      aria-label="Army distribution radial chart"
    >
      {/* Concentric guide rings */}
      {[110, 150, 185, MAX_R].map(r => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={1}
        />
      ))}

      {/* Centre disc */}
      <circle cx={CX} cy={CY} r={INNER_R} fill="#0f172a" stroke="#334155" strokeWidth={2} />
      <text x={CX} y={CY - 10} textAnchor="middle" fill="#f1f5f9" fontSize={34} fontWeight="bold">
        {totalPlayers}
      </text>
      <text x={CX} y={CY + 16} textAnchor="middle" fill="#64748b" fontSize={12}>
        PLAYERS
      </text>

      {/* Spokes */}
      {spokes.map((spoke, i) => {
        const angleDeg = (i / N) * 360 - 90;
        const barR = INNER_R + ((spoke.count / maxCount) * (MAX_R - INNER_R));

        const normalizedAngle = ((angleDeg % 360) + 360) % 360;
        const isLeftHalf = normalizedAngle > 90 && normalizedAngle < 270;
        const isHovered = hoveredArmy === spoke.army;
        const isDimmed = !!hoveredArmy && !isHovered;

        return (
          <g
            key={spoke.army}
            transform={`rotate(${angleDeg}, ${CX}, ${CY})`}
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHoveredArmy(spoke.army)}
            onMouseLeave={() => setHoveredArmy(null)}
          >
            {/* Bar */}
            <line
              x1={CX + INNER_R + 2}
              y1={CY}
              x2={CX + barR}
              y2={CY}
              stroke={spoke.color}
              strokeWidth={spoke.isMain ? 10 : 5}
              strokeLinecap="round"
              opacity={isDimmed ? 0.1 : 1}
            />
            {/* End cap */}
            <circle
              cx={CX + barR}
              cy={CY}
              r={spoke.isMain ? 6 : 3.5}
              fill={spoke.color}
              opacity={isDimmed ? 0.1 : 1}
            />
            {/* Label — flipped for left-half so it's always readable */}
            <text
              x={CX + LABEL_R}
              y={CY}
              textAnchor={isLeftHalf ? 'end' : 'start'}
              dominantBaseline="middle"
              fill={isHovered ? '#f1f5f9' : isDimmed ? '#1e293b' : spoke.isMain ? '#cbd5e1' : '#94a3b8'}
              fontSize={spoke.isMain ? 12 : 10}
              fontWeight={spoke.isMain ? 600 : 400}
              transform={
                isLeftHalf
                  ? `rotate(180, ${CX + LABEL_R}, ${CY})`
                  : undefined
              }
            >
              {spoke.army} ({spoke.count})
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default ArmyRadialChart;
