import React, { useEffect, useState } from 'react';
import styles from './main.module.scss';
import Highscore from '../highscore/highscore';
import Card from '../card/card';
import Filter from '../filter/filter';
import itemsData from '../../data/items.json';
import { ItemData, EItemTypes, EItemSubTypes } from '@/types/generalTypes';
import AuthStatus from '../authStatus/authStatus';
import Login from '../auth/login';

const items = itemsData as ItemData[];

export default function Main() {
    const [selectedTypes, setSelectedTypes] = useState<EItemTypes[]>([]);
    const [selectedSubTypes, setSelectedSubTypes] = useState<EItemSubTypes[]>(
        []
    );
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'points-high' | 'points-low' | 'name-asc' | 'name-desc'>('points-high');
    const [filteredItems, setFilteredItems] = useState<ItemData[]>(items);

    useEffect(() => {
        items.sort((a, b) => b.Points - a.Points);
    }, []);

    useEffect(() => {
        let filtered = items;

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
    }, [selectedTypes, selectedSubTypes, searchTerm, sortBy]);

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

    return (
        <main className={styles.main}>
            <div className={styles.left}>
                <Login />
                <AuthStatus />
                <Filter
                    selectedTypes={selectedTypes}
                    selectedSubTypes={selectedSubTypes}
                    onTypeChange={handleTypeChange}
                    onSubTypeChange={handleSubTypeChange}
                    onSearchChange={handleSearchChange}
                    onSortChange={handleSortChange}
                    allItems={items}
                />
            </div>
            <div className={styles.middle}>
                {filteredItems.map((item) => (
                    <Card key={item.Id} Item={item} />
                ))}
            </div>
            <div className={styles.right}>
                <Highscore />
            </div>
        </main>
    );
}
