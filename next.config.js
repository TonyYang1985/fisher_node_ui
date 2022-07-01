const { i18n, localeExtension, localePath } = require('./next-i18next.config');
const restClientConfig = require('./restclient.config');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { PHASE_PRODUCTION_BUILD } = require('next/constants');
const pkg = require('./package.json');
const withTM = require('next-transpile-modules')(['@fullcalendar/common', '@fullcalendar/daygrid', '@fullcalendar/timegrid']);

const cfg = {};

try {
  if (process.env.NODE_ENV === 'development') {
    if (process.env.DEV_ZONE === 'sg' && fs.existsSync('./cfg/proxy.sg.yml')) {
      cfg.application_dev = yaml.load(fs.readFileSync('./cfg/proxy.sg.yml', 'utf8'));
    } else if (fs.existsSync('./cfg/proxy.yml')) {
      cfg.application_dev = yaml.load(fs.readFileSync('./cfg/proxy.yml', 'utf8'));
    }
    console.log(`Running in ${process.env.NODE_ENV} mode. Proxy to ${cfg.application_dev.proxyTo}`);
  }
} catch (e) {
  console.log(e);
}

module.exports = (phase) => {
  return withTM({
    poweredByHeader: false,
    generateEtags: false,
    // basePath: `/${cfg.application.appName}`,
    i18n,
    publicRuntimeConfig: {
      appName: pkg.name,
      restClientConfig,
      localePath,
      localeExtension,
    },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: false,
    },
    images: {
      domains: ['spic.one'],
    },
    webpack(config, options) {
      if (!options.isServer && config.mode === 'development') {
        const { I18NextHMRPlugin } = require('i18next-hmr/plugin');
        config.plugins.push(
          new I18NextHMRPlugin({
            localesDir: path.resolve(__dirname, './locales'),
          }),
        );
      }
      if (!options.isServer) {
        config.resolve.fallback.fs = false;
      }
      config.module = {
        ...config.module,
        exprContextCritical: false,
      };
      return config;
    },
    async rewrites() {
      const rewrites = [];
      if (process.env.NODE_ENV === 'development') {
        return [
          {
            source: '/api/v1/:path*',
            destination: `${cfg.application_dev.proxyTo}/api/v1/:path*`,
          },
          ...rewrites,
        ];
      }
      return rewrites;
    },
  });
};
