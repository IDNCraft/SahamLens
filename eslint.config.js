import tsPlugin from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import eslintPluginPromise from 'eslint-plugin-promise'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginSecurity from 'eslint-plugin-security'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

const unicornRecommendedRules = Object.fromEntries(
    Object.entries(eslintPluginUnicorn.configs.recommended.rules).map(([rule, config]) => [
        rule,
        Array.isArray(config)
            ? ['warn', ...config.slice(1)]
            : config === 'error' || config === 2
                ? 'warn'
                : config,
    ]),
)

export default [
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'graphify-out/**',
            'coverage/**',
            '*.lock',
            'eslint.config.js',
        ],
    },
    eslintPluginUnicorn.configs.recommended,
    eslintPluginReactHooks.configs.flat.recommended,
    eslintPluginPromise.configs['flat/recommended'],
    eslintPluginSecurity.configs.recommended,
    eslintPluginPrettier,
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parser: tsParser,
            parserOptions: { projectService: true },
        },
        plugins: { '@typescript-eslint': tsPlugin },
        rules: {
            ...(tsPlugin.configs.recommended?.rules ?? {}),
            ...unicornRecommendedRules,
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/prefer-nullish-coalescing': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'warn',
            '@typescript-eslint/no-confusing-void-expression': 'warn',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/no-unsafe-assignment': 'warn',
            '@typescript-eslint/no-unsafe-member-access': 'warn',
            '@typescript-eslint/no-unsafe-call': 'warn',
            '@typescript-eslint/no-unsafe-return': 'warn',
            '@typescript-eslint/require-await': 'warn',
            '@typescript-eslint/no-misused-promises': 'warn',
            '@typescript-eslint/await-thenable': 'warn',
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
                {
                    selector: 'class',
                    format: ['PascalCase'],
                },
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    custom: { regex: '^I[A-Z]', match: false },
                },
            ],
            'prettier/prettier': 'warn',
            'react-hooks/exhaustive-deps': 'warn',
            'react-hooks/immutability': 'warn',
            'react-hooks/set-state-in-effect': 'warn',
            'max-len': [
                'warn',
                {
                    code: 100,
                    comments: 120,
                    ignoreUrls: true,
                    ignoreTemplateLiterals: true,
                    ignoreStrings: true,
                },
            ],
            'promise/always-return': 'off',
            'security/detect-object-injection': 'off',
            'security/detect-non-literal-fs-filename': 'off',
            'unicorn/prefer-module': 'warn',
            'unicorn/prefer-node-protocol': 'warn',
            'unicorn/filename-case': [
                'error',
                { cases: { camelCase: true, pascalCase: true, kebabCase: true } },
            ],
            'unicorn/no-for-loop': 'warn',
            'unicorn/no-instanceof-array': 'warn',
            'unicorn/prefer-number-properties': 'warn',
            'unicorn/catch-error-name': ['warn', { name: 'error' }],
            'unicorn/prefer-export-from': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/no-empty-file': 'off',
            'unicorn/consistent-function-scoping': 'off',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/no-null': 'off',
            'unicorn/prefer-top-level-await': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/prefer-ternary': 'off',
            'unicorn/no-process-exit': 'off',
        },
    },
]
