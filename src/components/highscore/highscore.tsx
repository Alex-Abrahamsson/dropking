'use client';

import React, { useEffect, useState } from 'react';
import styles from './highscore.module.scss';
import {
    getSeasonLeaderboard,
    getAllTimeLeaderboard,
    getCurrentSeasonId,
    LeaderboardEntry,
} from '@/utils/firestoreHelpers';

interface HighscoreProps {
    currentUserId: string | null;
}

export default function Highscore({ currentUserId }: HighscoreProps) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
    const [currentUserData, setCurrentUserData] =
        useState<LeaderboardEntry | null>(null);
    const [mode, setMode] = useState<'season' | 'all-time'>('season');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const data =
                    mode === 'season'
                        ? await getSeasonLeaderboard()
                        : await getAllTimeLeaderboard();
                setLeaderboard(data);

                // Find current user's rank
                if (currentUserId) {
                    const userIndex = data.findIndex(
                        (entry) => entry.userId === currentUserId
                    );
                    if (userIndex !== -1) {
                        setCurrentUserRank(userIndex + 1);
                        setCurrentUserData(data[userIndex]);
                    } else {
                        setCurrentUserRank(null);
                        setCurrentUserData(null);
                    }
                }
            } catch (error) {
                console.error('Error loading leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [currentUserId, mode]);

    const top10 = leaderboard.slice(0, 10);
    const showCurrentUser =
        currentUserData && currentUserRank && currentUserRank > 10;
    const seasonId = getCurrentSeasonId();
    const title = mode === 'season' ? seasonId.toUpperCase() : 'ALL-TIME';

    if (loading) {
        return (
            <section className={styles.highscore}>
                <h2>{title} HIGHSCORE</h2>
                <div className={styles.modeToggle}>
                    <button
                        className={`${styles.modeButton} ${
                            mode === 'season' ? styles.active : ''
                        }`}
                        onClick={() => setMode('season')}
                    >
                        Season
                    </button>
                    <button
                        className={`${styles.modeButton} ${
                            mode === 'all-time' ? styles.active : ''
                        }`}
                        onClick={() => setMode('all-time')}
                    >
                        All-Time
                    </button>
                </div>
                <p className={styles.loading}>Loading...</p>
            </section>
        );
    }

    return (
        <section className={styles.highscore}>
            <h2>{title} HIGHSCORE</h2>

            <div className={styles.modeToggle}>
                <button
                    className={`${styles.modeButton} ${
                        mode === 'season' ? styles.active : ''
                    }`}
                    onClick={() => setMode('season')}
                >
                    Season
                </button>
                <button
                    className={`${styles.modeButton} ${
                        mode === 'all-time' ? styles.active : ''
                    }`}
                    onClick={() => setMode('all-time')}
                >
                    All-Time
                </button>
            </div>

            <div className={styles.leaderboard}>
                {top10.length === 0 ? (
                    <p className={styles.empty}>Inga spelare än</p>
                ) : (
                    <>
                        {top10.map((entry, index) => (
                            <div
                                key={entry.userId}
                                className={`${styles.entry} ${
                                    entry.userId === currentUserId
                                        ? styles.currentUser
                                        : ''
                                } ${
                                    index < 3 ? styles[`rank${index + 1}`] : ''
                                }`}
                            >
                                <span className={styles.rank}>
                                    #{index + 1}
                                </span>
                                <span className={styles.name}>
                                    {entry.displayName}
                                </span>
                                <span className={styles.items}>
                                    {entry.itemCount} items
                                </span>
                                <span className={styles.points}>
                                    {entry.totalPoints.toLocaleString()} p
                                </span>
                            </div>
                        ))}

                        {showCurrentUser && (
                            <>
                                <div className={styles.separator}>...</div>
                                <div
                                    className={`${styles.entry} ${styles.currentUser}`}
                                >
                                    <span className={styles.rank}>
                                        #{currentUserRank}
                                    </span>
                                    <span className={styles.name}>
                                        {currentUserData.displayName}
                                    </span>
                                    <span className={styles.items}>
                                        {currentUserData.itemCount} items
                                    </span>
                                    <span className={styles.points}>
                                        {currentUserData.totalPoints.toLocaleString()}{' '}
                                        p
                                    </span>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
