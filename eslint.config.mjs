import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    {
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/no-explicit-any': 'error', // Förbjud 'any'
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ], // Varning för oanvända variabler
            '@typescript-eslint/explicit-function-return-type': 'off', // Kräv inte return type överallt (Next.js fungerar bra utan)
            '@typescript-eslint/no-non-null-assertion': 'warn', // Varna vid ! operator
            '@typescript-eslint/prefer-nullish-coalescing': 'error', // Använd ?? istället för ||
            '@typescript-eslint/prefer-optional-chain': 'error', // Använd ?. istället för &&
            '@typescript-eslint/strict-boolean-expressions': 'off', // För strikt för Next.js

            // General best practices
            'no-console': ['warn', { allow: ['warn', 'error'] }], // Varna vid console.log (tillåt warn/error)
            'prefer-const': 'error', // Använd const när möjligt
            'no-var': 'error', // Förbjud var
            eqeqeq: ['error', 'always'], // Kräv === istället för ==

            // React/Next.js specific
            'react/prop-types': 'off', // Vi använder TypeScript istället
            'react-hooks/rules-of-hooks': 'error', // Följ hook-regler
            'react-hooks/exhaustive-deps': 'warn', // Varna vid saknade dependencies

            // Import rules
            'import/no-anonymous-default-export': 'off', // Next.js använder detta ibland
            'import/order': [
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'always',
                    alphabetize: { order: 'asc' },
                },
            ],
        },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);

export default eslintConfig;
