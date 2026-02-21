import React from 'react';
import clsx from 'clsx';
import styles from './LoadingSkeleton.module.css';

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
        <div className={styles.statCardGrid}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={styles.statCardItem}>
              <div className={clsx(styles.skeleton, styles.statCardIcon)} />
              <div className={clsx(styles.skeleton, styles.statCardLabel)} />
              <div className={clsx(styles.skeleton, styles.statCardValue)} />
            </div>
          ))}
        </div>
      );

    case 'table-rows':
      return (
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className={clsx(styles.skeleton, styles.tableHeaderCell)} />
            ))}
          </div>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={styles.tableRow}>
              <div className={clsx(styles.skeleton, styles.tableCellNarrow)} />
              {Array.from({ length: columns - 1 }).map((_, j) => (
                <div key={j} className={clsx(styles.skeleton, styles.tableCell)} />
              ))}
            </div>
          ))}
        </div>
      );

    case 'card':
      return (
        <>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className={styles.cardItem}>
              {Array.from({ length: lines }).map((_, j) => (
                <div key={j} className={clsx(styles.skeleton, styles.cardLine)} />
              ))}
            </div>
          ))}
        </>
      );

    default:
      return null;
  }
};

export default LoadingSkeleton;
