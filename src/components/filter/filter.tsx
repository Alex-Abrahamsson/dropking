'use client';
import React, { useState, useMemo } from 'react';
import styles from './filter.module.scss';
import { EItemTypes, EItemSubTypes, ItemData } from '@/types/generalTypes';

interface IFilter {
    selectedTypes: EItemTypes[];
    selectedSubTypes: EItemSubTypes[];
    onTypeChange: (type: EItemTypes) => void;
    onSubTypeChange: (subType: EItemSubTypes) => void;
    onSearchChange: (searchTerm: string) => void;
    onSortChange: (
        sortBy: 'points-high' | 'points-low' | 'name-asc' | 'name-desc'
    ) => void;
    onViewChange: (view: 'not-found' | 'found') => void;
    allItems: ItemData[];
    currentView: 'not-found' | 'found';
}

export default function Filter({
    selectedTypes,
    selectedSubTypes,
    onTypeChange,
    onSubTypeChange,
    onSearchChange,
    onSortChange,
    onViewChange,
    allItems,
    currentView,
}: IFilter) {
    const itemTypes = Object.values(EItemTypes);
    const itemSubTypes = Object.values(EItemSubTypes);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [sortBy, setSortBy] = useState<
        'points-high' | 'points-low' | 'name-asc' | 'name-desc'
    >('points-high');

    const suggestions = useMemo(() => {
        if (searchTerm.length < 2) return [];

        return allItems
            .filter((item) =>
                item.ItemName.toLowerCase().startsWith(searchTerm.toLowerCase())
            )
            .slice(0, 10)
            .sort((a, b) => a.ItemName.localeCompare(b.ItemName));
    }, [searchTerm, allItems]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        onSearchChange(value);
        setShowSuggestions(value.length >= 2);
    };

    const handleSuggestionClick = (itemName: string) => {
        setSearchTerm(itemName);
        onSearchChange(itemName);
        setShowSuggestions(false);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearchChange('');
        setShowSuggestions(false);
    };

    const handleSortChange = (
        value: 'points-high' | 'points-low' | 'name-asc' | 'name-desc'
    ) => {
        setSortBy(value);
        onSortChange(value);
    };

    return (
        <div className={styles.filter}>
            {/* View Toggle */}
            <div className={styles.filterSection}>
                <h3>View</h3>
                <div className={styles.viewToggle}>
                    <button
                        className={`${styles.viewButton} ${
                            currentView === 'not-found' ? styles.active : ''
                        }`}
                        onClick={() => onViewChange('not-found')}
                    >
                        Not Found
                    </button>
                    <button
                        className={`${styles.viewButton} ${
                            currentView === 'found' ? styles.active : ''
                        }`}
                        onClick={() => onViewChange('found')}
                    >
                        Found Items
                    </button>
                </div>
            </div>

            <div className={styles.filterSection}>
                <h3>Search</h3>
                <div className={styles.searchContainer}>
                    <input
                        type='text'
                        className={styles.searchInput}
                        placeholder='Search items...'
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() =>
                            searchTerm.length >= 2 && setShowSuggestions(true)
                        }
                        onBlur={() =>
                            setTimeout(() => setShowSuggestions(false), 200)
                        }
                    />
                    {searchTerm && (
                        <button
                            className={styles.clearButton}
                            onClick={clearSearch}
                        >
                            ✕
                        </button>
                    )}

                    {showSuggestions && suggestions.length > 0 && (
                        <div className={styles.suggestions}>
                            {suggestions.map((item) => (
                                <div
                                    key={item.Id}
                                    className={styles.suggestionItem}
                                    onClick={() =>
                                        handleSuggestionClick(item.ItemName)
                                    }
                                >
                                    <span className={styles.suggestionName}>
                                        {item.ItemName}
                                    </span>
                                    <span className={styles.suggestionType}>
                                        {item.ItemType}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.filterSection}>
                <h3>Sort By</h3>
                <select
                    className={styles.sortSelect}
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value as any)}
                >
                    <option value='points-high'>Points (High to Low)</option>
                    <option value='points-low'>Points (Low to High)</option>
                    <option value='name-asc'>Name (A-Z)</option>
                    <option value='name-desc'>Name (Z-A)</option>
                </select>
            </div>

            <div className={styles.filterSection}>
                <h3>Item Type</h3>
                {itemTypes.map((type) => (
                    <label key={type} className={styles.filterOption}>
                        <input
                            type='checkbox'
                            checked={selectedTypes.includes(type)}
                            onChange={() => onTypeChange(type)}
                        />
                        <span>{type}</span>
                    </label>
                ))}
            </div>

            <div className={styles.filterSection}>
                <h3>Sub Type</h3>
                {itemSubTypes.map((subType) => (
                    <label key={subType} className={styles.filterOption}>
                        <input
                            type='checkbox'
                            checked={selectedSubTypes.includes(subType)}
                            onChange={() => onSubTypeChange(subType)}
                        />
                        <span>{subType}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
