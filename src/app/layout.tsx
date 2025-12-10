import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const diabloFont = localFont({
    src: './fonts/DiabloFont2.ttf',
    variable: '--font-diablo',
    weight: '400',
});

const diabloFont2 = localFont({
    src: './fonts/DiabloFont.ttf',
    variable: '--font-diablo-bold',
    weight: '400',
});

export const metadata: Metadata = {
    title: 'Diablo 2 Drop King',
    description: 'Be the king of Diablo 2 item drops!',
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang='en'>
            <body className={`${diabloFont.variable} ${diabloFont2.variable}`}>
                {children}
            </body>
        </html>
    );
}
