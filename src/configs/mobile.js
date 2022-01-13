const config = {
    extends: 'lighthouse:default',
    settings: {
        maxWaitForFcp: 15 * 1000,
        maxWaitForLoad: 35 * 1000,
        // Skip the h2 audit so it doesn't lie to us. See https://github.com/GoogleChrome/lighthouse/issues/6539
        skipAudits: ['uses-http2'],
    },
    audits: [
        'metrics/first-contentful-paint-3g',
    ],
    categories: {
        performance: ({
            auditRefs: [
                { id: 'first-contentful-paint-3g', weight: 0 },
            ],
        }),
    },
};

module.exports = config;