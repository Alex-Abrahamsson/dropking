'use client';

import Image from 'next/image';
import styles from './page.module.css';
import { useMobile } from '@/hooks/useMobile';
import Main from '@/components/main/main';

export default function Home() {
    const isMobile = useMobile();
    return (
        <div className={styles.page}>
            <Main />
        </div>
    );
}
