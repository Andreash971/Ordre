const path = require('node:path')
const fs = require('node:fs')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')

const { WIN_CSC_LINK, WIN_CSC_KEY_PASSWORD } = process.env

const { version: appVersion } = require('./package.json')

const iconBase = path.resolve(__dirname, 'assets/icon')
const hasIcnsIcon = fs.existsSync(`${iconBase}.icns`)
const hasIcoIcon = fs.existsSync(`${iconBase}.ico`)
const setupIconPath = path.resolve(__dirname, 'assets/icon.ico')
const loadingGifPath = path.resolve(__dirname, 'assets/installer-loading.gif')

module.exports = {
  packagerConfig: {
    appBundleId: 'no.andreas.ordre',
    name: 'Ordre',
    executableName: 'ordre',
    ...(hasIcnsIcon || hasIcoIcon ? { icon: iconBase } : {}),
    asar: true,
    extraResource: ['drizzle'],
    ignore: [
      /^\/electron($|\/)/,
      /^\/src($|\/)/,
      /^\/public($|\/)/,
      /^\/assets($|\/)/,
      /^\/dist\/(client|server)($|\/)/,
      /^\/drizzle\/meta($|\/)/,
      /^\/node_modules\/\.cache($|\/)/,
      /^\/storybook-static($|\/)/,
      /^\/release($|\/)/,
      /^\/out($|\/)/,
      /^\/\.github($|\/)/,
      /^\/\.storybook($|\/)/,
      /^\/\.tanstack($|\/)/,
      /^\/\.vscode($|\/)/,
      /^\/\.claude($|\/)/,
      /^\/forge\.config\.cjs$/,
      /^\/vite\.config\.ts$/,
      /^\/tsconfig.*\.json$/,
      /^\/eslint\.config\..*$/,
      /^\/prettier\.config\..*$/,
      /^\/drizzle\.config\..*$/,
      /^\/components\.json$/,
      /^\/index\.html$/,
      /^\/README\.md$/,
      /^\/\.prettier.*$/,
      /^\/\.gitignore$/,
      /^\/\.env.*$/,
    ],
  },

  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ordre',
        setupExe: `Ordre-Setup-${appVersion}.exe`,
        ...(fs.existsSync(setupIconPath) ? { setupIcon: setupIconPath } : {}),
        ...(fs.existsSync(loadingGifPath)
          ? { loadingGif: loadingGifPath }
          : {}),
        ...(WIN_CSC_LINK
          ? {
              certificateFile: WIN_CSC_LINK,
              certificatePassword: WIN_CSC_KEY_PASSWORD,
            }
          : {}),
      },
    },
  ],

  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: { owner: 'Andreash971', name: 'Ordre' },
        prerelease: true,
        draft: true,
      },
    },
  ],

  plugins: [
    { name: '@electron-forge/plugin-auto-unpack-natives', config: {} },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      },
    },
  ],
}
