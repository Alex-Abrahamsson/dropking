'use client';
import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged,
    User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import styles from './login.module.scss';

interface LoginProps {
    totalPoints?: number;
}

export default function Login({ totalPoints = 0 }: LoginProps) {
    const [error, setError] = useState('');
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Save user info to Firestore
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                // Create new user document
                await setDoc(userRef, {
                    displayName: user.displayName || 'Anonymous',
                    email: user.email,
                    createdAt: new Date().toISOString(),
                });
            } else {
                // Update existing user with displayName if missing
                const userData = userDoc.data();
                if (!userData.displayName) {
                    await setDoc(
                        userRef,
                        {
                            ...userData,
                            displayName: user.displayName || 'Anonymous',
                        },
                        { merge: true }
                    );
                }
            }

            console.log('Logged in with Google successfully!');
        } catch (err: any) {
            setError(err.message);
            console.error('Auth error:', err);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            console.log('Signed out successfully!');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.login}>
            {!user ? (
                <>
                    <button
                        className={styles.googleButton}
                        onClick={handleGoogleSignIn}
                    >
                        <svg width='18' height='18' viewBox='0 0 18 18'>
                            <path
                                fill='#4285F4'
                                d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z'
                            />
                            <path
                                fill='#34A853'
                                d='M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z'
                            />
                            <path
                                fill='#FBBC05'
                                d='M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z'
                            />
                            <path
                                fill='#EA4335'
                                d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z'
                            />
                        </svg>
                        Sign in with Google
                    </button>
                    {error && <p className={styles.error}>{error}</p>}
                </>
            ) : (
                <>
                    <p className={styles.userName}>
                        {user.displayName || user.email}
                    </p>
                    <p className={styles.points}>Points: {totalPoints}</p>
                    <button className={styles.signOut} onClick={handleSignOut}>
                        Sign Out
                    </button>
                </>
            )}
        </div>
    );
}
