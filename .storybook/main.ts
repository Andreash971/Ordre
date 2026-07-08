import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  async viteFinal(config) {
    const { default: tailwindcss } = await import('@tailwindcss/vite')
    const { default: tsconfigPaths } = await import('vite-tsconfig-paths')
    config.plugins = config.plugins || []
    config.plugins.push(
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
    )
    return config
  },
}
export default config
