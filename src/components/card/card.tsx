import React, { useState } from 'react';
import styles from './card.module.scss';
import { EItemTypes, ItemData } from '@/types/generalTypes';

interface ICard {
    Item: ItemData
}

export default function Card({ Item }: ICard) {
    const [isChecked, setIsChecked] = useState(false);
    const itemName = Item.ItemName;
    const itemType = Item.ItemType;
    const itemSubType = Item.SubType;
    const itemPoints = Item.Points;

    const getBorderColor = (itemType: EItemTypes) => {
        switch (itemType) {
            case EItemTypes.Rune:
                return '1px solid white';
            case EItemTypes.SetItem:
                return '1px solid green';
            case EItemTypes.UniqueItem:
                return '1px solid gold';
            default:
                return '1px solid gray';
        }
    };

    return (
        <div
            className={styles.card}
            style={{ border: getBorderColor(itemType) }}
        >
            <h3>{itemName}</h3>
            <div className={styles.cardDetails}>
                <div className={styles.cardInfo}>
                    {itemSubType !== 'None' && <p>SubType: {itemSubType}</p>}
                    <p>Points: {itemPoints}</p>
                </div>
                <div className={styles.cardActions}>
                    <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={(e) => setIsChecked(e.target.checked)}
                    />
                </div>
            </div>
        </div>
    );
}
