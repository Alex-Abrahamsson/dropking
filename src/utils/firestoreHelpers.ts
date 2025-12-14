import { db } from '@/lib/firebase';
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    getDoc,
    writeBatch,
    query,
    orderBy,
    limit,
} from 'firebase/firestore';

export interface FoundItem {
    itemId: number;
    points: number;
}

export interface LeaderboardEntry {
    userId: string;
    displayName: string;
    totalPoints: number;
    itemCount: number;
}

// Get current season ID (format: "season-12")
export function getCurrentSeasonId(): string {
    // You can change this to match your season logic
    // For now, using a simple format: "season-1" (starting Dec 2025)
    const startDate = new Date('2025-12-01');
    const now = new Date();
    const monthsSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    const seasonNumber = Math.floor(monthsSinceStart / 3) + 1; // 3 months per season
    return `season-${seasonNumber}`;
}

// Add item to season and all-time
export async function addFoundItem(
    userId: string,
    item: FoundItem,
    mode: 'season' | 'all-time'
): Promise<void> {
    try {
        const batch = writeBatch(db);

        if (mode === 'season') {
            const seasonId = getCurrentSeasonId();

            // Add to current season
            const seasonItemRef = doc(
                db,
                'users',
                userId,
                'seasons',
                seasonId,
                'foundItems',
                item.itemId.toString()
            );
            batch.set(seasonItemRef, {
                itemId: item.itemId,
                points: item.points,
                foundAt: new Date(),
            });

            // Also add to all-time
            const allTimeItemRef = doc(
                db,
                'users',
                userId,
                'allTimeData',
                'data',
                'foundItems',
                item.itemId.toString()
            );
            batch.set(allTimeItemRef, {
                itemId: item.itemId,
                points: item.points,
                foundAt: new Date(),
            });
        } else {
            // Only add to all-time (not season)
            const allTimeItemRef = doc(
                db,
                'users',
                userId,
                'allTimeData',
                'data',
                'foundItems',
                item.itemId.toString()
            );
            batch.set(allTimeItemRef, {
                itemId: item.itemId,
                points: item.points,
                foundAt: new Date(),
            });
        }

        await batch.commit();
    } catch (error) {
        console.error('Error adding found item:', error);
        throw error;
    }
}

// Remove item from season or all-time
export async function removeFoundItem(
    userId: string,
    itemId: number,
    mode: 'season' | 'all-time'
): Promise<void> {
    try {
        const batch = writeBatch(db);

        if (mode === 'season') {
            const seasonId = getCurrentSeasonId();

            // Remove from current season only
            const seasonItemRef = doc(
                db,
                'users',
                userId,
                'seasons',
                seasonId,
                'foundItems',
                itemId.toString()
            );
            batch.delete(seasonItemRef);
        } else {
            // Remove from all-time AND all seasons
            const allTimeItemRef = doc(
                db,
                'users',
                userId,
                'allTimeData',
                'data',
                'foundItems',
                itemId.toString()
            );
            batch.delete(allTimeItemRef);

            // Note: To remove from all seasons would require querying all seasons
            // For simplicity, we'll just remove from all-time
            // You could add logic to remove from all seasons if needed
        }

        await batch.commit();
    } catch (error) {
        console.error('Error removing found item:', error);
        throw error;
    }
}

// Get found items for season or all-time
export async function getFoundItems(
    userId: string,
    mode: 'season' | 'all-time'
): Promise<{ itemIds: number[]; totalPoints: number }> {
    try {
        let foundItemsRef;

        if (mode === 'season') {
            const seasonId = getCurrentSeasonId();
            foundItemsRef = collection(
                db,
                'users',
                userId,
                'seasons',
                seasonId,
                'foundItems'
            );
        } else {
            foundItemsRef = collection(
                db,
                'users',
                userId,
                'allTimeData',
                'data',
                'foundItems'
            );
        }

        const snapshot = await getDocs(foundItemsRef);
        const items = snapshot.docs.map((doc) => doc.data() as FoundItem);
        const itemIds = items.map((item) => item.itemId);
        const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
        return { itemIds, totalPoints };
    } catch (error) {
        console.error('Error getting found items:', error);
        throw error;
    }
}

// Get leaderboard for current season
export async function getSeasonLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
        const seasonId = getCurrentSeasonId();
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const leaderboard: LeaderboardEntry[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Get season found items
            const seasonItemsRef = collection(
                db,
                'users',
                userId,
                'seasons',
                seasonId,
                'foundItems'
            );
            const seasonSnapshot = await getDocs(seasonItemsRef);

            if (seasonSnapshot.empty) continue;

            const items = seasonSnapshot.docs.map(
                (doc) => doc.data() as FoundItem
            );
            const totalPoints = items.reduce(
                (sum, item) => sum + item.points,
                0
            );

            leaderboard.push({
                userId,
                displayName:
                    userData.displayName || userData.email || 'Anonymous',
                totalPoints,
                itemCount: items.length,
            });
        }

        // Sort by points (highest first)
        return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        throw error;
    }
}

// Get leaderboard for all-time
export async function getAllTimeLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);

        const leaderboard: LeaderboardEntry[] = [];

        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();

            // Get all-time found items
            const allTimeItemsRef = collection(
                db,
                'users',
                userId,
                'allTimeData',
                'data',
                'foundItems'
            );
            const allTimeSnapshot = await getDocs(allTimeItemsRef);

            if (allTimeSnapshot.empty) continue;

            const items = allTimeSnapshot.docs.map(
                (doc) => doc.data() as FoundItem
            );
            const totalPoints = items.reduce(
                (sum, item) => sum + item.points,
                0
            );

            leaderboard.push({
                userId,
                displayName:
                    userData.displayName || userData.email || 'Anonymous',
                totalPoints,
                itemCount: items.length,
            });
        }

        // Sort by points (highest first)
        return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
    } catch (error) {
        console.error('Error getting all-time leaderboard:', error);
        throw error;
    }
}
