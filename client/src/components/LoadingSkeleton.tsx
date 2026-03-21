import React from 'react';
import { Skeleton, Group, Stack, Paper } from '@mantine/core';

interface SkeletonProps {
  variant: 'stat-card' | 'table-rows' | 'card';
  count?: number;
  columns?: number;
  lines?: number;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({
  variant,
  count = 3,
  columns = 6,
  lines = 3,
}) => {
  switch (variant) {
    case 'stat-card':
      return (
        <Group grow>
          {Array.from({ length: count }).map((_, i) => (
            <Paper key={i} p="md" radius="md" bg="dark.7">
              <Stack gap="sm">
                <Skeleton height={20} width="40%" />
                <Skeleton height={32} width="60%" />
                <Skeleton height={14} width="30%" />
              </Stack>
            </Paper>
          ))}
        </Group>
      );

    case 'table-rows':
      return (
        <Stack gap="xs">
          <Group gap="xs">
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} height={16} style={{ flex: 1 }} />
            ))}
          </Group>
          {Array.from({ length: count }).map((_, i) => (
            <Group key={i} gap="xs">
              <Skeleton height={20} width={40} />
              {Array.from({ length: columns - 1 }).map((_, j) => (
                <Skeleton key={j} height={20} style={{ flex: 1 }} />
              ))}
            </Group>
          ))}
        </Stack>
      );

    case 'card':
      return (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <Paper key={i} p="md" radius="md" bg="dark.7" mb="sm">
              <Stack gap="sm">
                {Array.from({ length: lines }).map((_, j) => (
                  <Skeleton key={j} height={16} width={j === 0 ? '80%' : '60%'} />
                ))}
              </Stack>
            </Paper>
          ))}
        </>
      );

    default:
      return null;
  }
};

export default LoadingSkeleton;
