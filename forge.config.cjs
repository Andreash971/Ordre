const path = require('node:path')
const fs = require('node:fs')
const { FuseV1Options, FuseVersion } = require('@electron/fuses')

const {
  NUCLEUS_HOST,
  NUCLEUS_APP_ID,
  NUCLEUS_CHANNEL_ID,
  NUCLEUS_TOKEN,
  APPLE_ID,
  APPLE_APP_SPECIFIC_PASSWORD,
  APPLE_TEAM_ID,
  MAC_CSC_LINK,
  WIN_CSC_LINK,
  WIN_CSC_KEY_PASSWORD,
} = process.env

const { version: appVersion } = require('./package.json')

const iconBase = path.resolve(__dirname, 'assets/icon')
const hasIcnsIcon = fs.existsSync(`${iconBase}.icns`)
const hasIcoIcon = fs.existsSync(`${iconBase}.ico`)
const setupIconPath = path.resolve(__dirname, 'assets/icon.ico')
const loadingGifPath = path.resolve(__dirname, 'assets/installer-loading.gif')

const macSigning = MAC_CSC_LINK
  ? {
      osxSign: {
        optionsForFile: () => ({
          entitlements: path.resolve(
            __dirname,
            'assets/entitlements.mac.plist',
          ),
          hardenedRuntime: true,
          'gatekeeper-assess': false,
        }),
      },
      osxNotarize:
        APPLE_ID && APPLE_APP_SPECIFIC_PASSWORD && APPLE_TEAM_ID
          ? {
              appleId: APPLE_ID,
              appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
              teamId: APPLE_TEAM_ID,
            }
          : undefined,
    }
  : {}

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
    ...macSigning,
  },

  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'ordre',
        // Nucleus requires the version string in the uploaded filename
        // for cache-busting, so embed package.json's version here.
        setupExe: `Ordre-Setup-${appVersion}.exe`,
        iconUrl: 'https://update.phenriksen.no/static/icon.ico',
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
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],

  publishers: NUCLEUS_HOST
    ? [
        {
          name: '@electron-forge/publisher-nucleus',
          config: {
            host: NUCLEUS_HOST,
            appId: NUCLEUS_APP_ID,
            channelId: NUCLEUS_CHANNEL_ID,
            token: NUCLEUS_TOKEN,
          },
        },
      ]
    : [],

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
