export enum EItemTypes {
    Rune = 'Rune',
    SetItem = 'SetItem',
    UniqueItem = 'UniqueItem',
}

export enum EItemSubTypes {
    None = 'None',
    Helmet = 'Helmet',
    Chest = 'Chest',
    Gloves = 'Gloves',
    Belt = 'Belt',
    Boots = 'Boots',
    Shield = 'Shield',
    Weapon = 'Weapon',
    Amulet = 'Amulet',
    Ring = 'Ring',
    Jewel = 'Jewel',
    Charm = 'Charm',
}

export type ItemData = {
    Id: number;
    ItemName: string;
    ItemType: EItemTypes;
    SubType: EItemSubTypes;
    Points: number;
};
