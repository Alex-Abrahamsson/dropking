import React, { useState } from 'react';
import Image from 'next/image';
import styles from './card.module.scss';
import { EItemTypes, ItemData } from '@/types/generalTypes';

interface ICard {
    Item: ItemData;
    onItemFound: (item: ItemData, isFound: boolean) => void;
    isFound: boolean;
}

export default function Card({ Item, onItemFound, isFound }: ICard) {
    const [isChecked, setIsChecked] = useState(isFound);
    const itemName = Item.ItemName;
    const itemType = Item.ItemType;
    const itemSubType = Item.SubType;
    const itemPoints = Item.Points;

    // Get image path based on item type
    const getImagePath = (): string | null => {
        // Runes: use item name (e.g., "El Rune" -> "el.png")
        if (itemType === EItemTypes.Rune) {
            const runeName = itemName.toLowerCase().replace(' rune', '').trim();
            return `/assets/runes/${runeName}.png`;
        }

        // Check for amulets, rings, charms, jewels
        const lowerName = itemName.toLowerCase();
        const lowerSubType = itemSubType.toLowerCase();

        if (lowerName.includes('amulet') || lowerSubType.includes('amulet')) {
            return '/assets/amu.png';
        }
        if (lowerName.includes('ring') || lowerSubType.includes('ring')) {
            return '/assets/ring.png';
        }
        if (lowerName.includes('charm') || lowerSubType.includes('charm')) {
            return '/assets/charm.png';
        }
        if (lowerName.includes('jewel') || lowerSubType.includes('jewel')) {
            return '/assets/jewel.png';
        }

        return null;
    };

    const imagePath = getImagePath();

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsChecked(checked);
        onItemFound(Item, checked);
    };

    const getBorderColor = (itemType: EItemTypes) => {
        switch (itemType) {
            case EItemTypes.Rune:
                return '1px solid white';
            case EItemTypes.SetItem:
                return '1px solid green';
            case EItemTypes.UniqueItem:
                return '1px solid gold';
            default:
                return '1px solid blue';
        }
    };

    return (
        <div
            className={styles.card}
            style={{ border: getBorderColor(itemType) }}
        >
            <div className={styles.cardHeader}>
                {imagePath && (
                    <div className={styles.cardImage}>
                        <Image
                            src={imagePath}
                            alt={itemName}
                            width={32}
                            height={32}
                            className={styles.itemImage}
                            unoptimized
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}
                <h3>{itemName}</h3>
            </div>
            <div className={styles.cardDetails}>
                <div className={styles.cardInfo}>
                    {/* {itemSubType !== 'None' && <p>SubType: {itemSubType}</p>} */}
                    <p>Points: {itemPoints}</p>
                </div>
                <div className={styles.cardActions}>
                    <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={handleCheckboxChange}
                    />
                </div>
            </div>
        </div>
    );
}
