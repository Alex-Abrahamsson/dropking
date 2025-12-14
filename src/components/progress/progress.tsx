import React from 'react';
import styles from './progress.module.scss';
import { getCurrentSeasonId } from '@/utils/firestoreHelpers';

interface ProgressProps {
    currentPoints: number;
    maxPoints: number;
    foundItems: number;
    maxItems: number;
}

export default function Progress({
    currentPoints,
    maxPoints,
    foundItems,
    maxItems,
}: ProgressProps) {
    const seasonId = getCurrentSeasonId();
    const percentage =
        maxPoints > 0 ? Math.round((currentPoints / maxPoints) * 100) : 0;

    return (
        <div className={styles.progress}>
            <div className={styles.header}>
                <h3>Completion</h3>
                <span className={styles.modeBadge}>
                    {seasonId.toUpperCase()}
                </span>
            </div>
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${percentage}%` }}
                >
                    <span className={styles.progressText}>{percentage}%</span>
                </div>
            </div>
            <div className={styles.statsContainer}>
                <p className={styles.progressStats}>
                    Items: {foundItems} / {maxItems}
                </p>
                <p className={styles.progressStats}>
                    Poäng: {currentPoints.toLocaleString()} /{' '}
                    {maxPoints.toLocaleString()}
                </p>
            </div>
        </div>
    );
}
