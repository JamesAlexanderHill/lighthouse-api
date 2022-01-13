const constants = require('../util/constants.js');

const config = {
    extends: 'lighthouse:default',
    settings: {
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,
        formFactor: 'desktop',
        throttling: constants.throttling.desktopDense4G,
        screenEmulation: constants.screenEmulationMetrics.desktop,
        emulatedUserAgent: constants.userAgents.desktop,
        // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
        skipAudits: ['uses-http2'],
    },
};

module.exports = config;