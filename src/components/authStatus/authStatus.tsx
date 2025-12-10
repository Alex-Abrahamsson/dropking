'use client';
import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import styles from './authStatus.module.scss';

export default function AuthStatus() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            console.log('Current user:', currentUser);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className={styles.authStatus}>Loading...</div>;
    }

    return (
        <div className={styles.authStatus}>
            {user ? (
                <div>
                    <h3>Logged in</h3>
                </div>
            ) : (
                <div>
                    <h3>Not logged in</h3>
                </div>
            )}
        </div>
    );
}
