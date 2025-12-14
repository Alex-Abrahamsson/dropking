import React, { useEffect, useState } from 'react';
import styles from './main.module.scss';
import Highscore from '../highscore/highscore';
import Card from '../card/card';
import Filter from '../filter/filter';
import Progress from '../progress/progress';
import itemsData from '../../data/items.json';
import { ItemData, EItemTypes, EItemSubTypes } from '@/types/generalTypes';
import Login from '../auth/login';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    addFoundItem,
    removeFoundItem,
    getFoundItems,
} from '@/utils/firestoreHelpers';

const items = itemsData as ItemData[];
const maxPoints = items.reduce((sum, item) => sum + item.Points, 0);
const maxItems = items.length;

export default function Main() {
    const [selectedTypes, setSelectedTypes] = useState<EItemTypes[]>([]);
    const [selectedSubTypes, setSelectedSubTypes] = useState<EItemSubTypes[]>(
        []
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<
        'points-high' | 'points-low' | 'name-asc' | 'name-desc'
    >('points-high');
    const [currentView, setCurrentView] = useState<'not-found' | 'found'>(
        'not-found'
    );
    const [filteredItems, setFilteredItems] = useState<ItemData[]>(items);
    const [foundItemIds, setFoundItemIds] = useState<number[]>([]);
    const [totalPoints, setTotalPoints] = useState<number>(0);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        items.sort((a, b) => b.Points - a.Points);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                const { itemIds, totalPoints } = await getFoundItems(
                    user.uid,
                    'season'
                );
                setFoundItemIds(itemIds);
                setTotalPoints(totalPoints);
            } else {
                setUserId(null);
                setFoundItemIds([]);
                setTotalPoints(0);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = items;

        // Filter baserat på view (found vs not found)
        if (currentView === 'found') {
            filtered = filtered.filter((item) =>
                foundItemIds.includes(item.Id)
            );
        } else {
            filtered = filtered.filter(
                (item) => !foundItemIds.includes(item.Id)
            );
        }

        if (searchTerm) {
            filtered = filtered.filter((item) =>
                item.ItemName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedTypes.length > 0) {
            filtered = filtered.filter((item) =>
                selectedTypes.includes(item.ItemType as EItemTypes)
            );
        }

        if (selectedSubTypes.length > 0) {
            filtered = filtered.filter((item) =>
                selectedSubTypes.includes(item.SubType as EItemSubTypes)
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'points-high':
                    return b.Points - a.Points;
                case 'points-low':
                    return a.Points - b.Points;
                case 'name-asc':
                    return a.ItemName.localeCompare(b.ItemName);
                case 'name-desc':
                    return b.ItemName.localeCompare(a.ItemName);
                default:
                    return 0;
            }
        });

        setFilteredItems(sorted);
    }, [
        selectedTypes,
        selectedSubTypes,
        searchTerm,
        sortBy,
        foundItemIds,
        currentView,
    ]);

    const handleItemFound = async (item: ItemData, isFound: boolean) => {
        if (!userId) {
            console.error('User must be logged in to mark items as found');
            return;
        }

        try {
            if (isFound) {
                await addFoundItem(
                    userId,
                    {
                        itemId: item.Id,
                        points: item.Points,
                    },
                    'season'
                );
                setFoundItemIds((prev) => [...prev, item.Id]);
                setTotalPoints((prev) => prev + item.Points);
            } else {
                await removeFoundItem(userId, item.Id, 'season');
                setFoundItemIds((prev) => prev.filter((id) => id !== item.Id));
                setTotalPoints((prev) => prev - item.Points);
            }
        } catch (error) {
            console.error('Error updating found item:', error);
        }
    };

    const handleTypeChange = (type: EItemTypes) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const handleSubTypeChange = (subType: EItemSubTypes) => {
        setSelectedSubTypes((prev) =>
            prev.includes(subType)
                ? prev.filter((st) => st !== subType)
                : [...prev, subType]
        );
    };

    const handleSearchChange = (search: string) => {
        setSearchTerm(search);
    };

    const handleSortChange = (
        sort: 'points-high' | 'points-low' | 'name-asc' | 'name-desc'
    ) => {
        setSortBy(sort);
    };

    const handleViewChange = (view: 'not-found' | 'found') => {
        setCurrentView(view);
    };

    return (
        <main className={styles.main}>
            <div className={styles.left}>
                <Login totalPoints={totalPoints} />
                <Progress
                    currentPoints={totalPoints}
                    maxPoints={maxPoints}
                    foundItems={foundItemIds.length}
                    maxItems={maxItems}
                />
                <Filter
                    selectedTypes={selectedTypes}
                    selectedSubTypes={selectedSubTypes}
                    onTypeChange={handleTypeChange}
                    onSubTypeChange={handleSubTypeChange}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                    onViewChange={handleViewChange}
                    allItems={items}
                    currentView={currentView}
                />
            </div>
            <div className={styles.middle}>
                {filteredItems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>
                            {currentView === 'found'
                                ? 'No items found yet. Start hunting! 🎯'
                                : 'All items found! 🎉'}
                        </p>
                    </div>
                ) : (
                    filteredItems.map((item) => (
                        <Card
                            key={item.Id}
                            Item={item}
                            onItemFound={handleItemFound}
                            isFound={foundItemIds.includes(item.Id)}
                        />
                    ))
                )}
            </div>
            <div className={styles.right}>
                <Highscore currentUserId={userId} />
            </div>
        </main>
    );
}
