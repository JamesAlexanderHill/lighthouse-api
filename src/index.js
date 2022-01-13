const express = require("express");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const desktopConfig = require('./configs/desktop');
const mobileConfig = require('./configs/mobile');

const app = express();
const PORT = process.env.PORT || 3000;

const launchChromeAndRunLighthouse = (url, device, categories) => {
    const flags = {
        chromeFlags: ['--headless'],
        onlyCategories: categories,
    };

    return chromeLauncher.launch(flags).then(chrome => {
        flags.port = chrome.port;
        const config = device === 'mobile' ? mobileConfig : desktopConfig;

        return lighthouse(url, flags, config).then(results => {
            return chrome.kill().then(() => results.report);
        });
    });
};

app.get('/', (req, res) => res.status(200).json({status: 'online'}));
app.get('/score', async (req, res) => {
    const {url, device, categories} = req.query;
    if (!url || url === '') return res.status(400).json({ error: 'URL is invalid' });
    if (!device || !(device == 'mobile' || device == 'desktop')) return res.status(400).json({ error: 'Device is invalid' });

    const categoriesFallback = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
    let categoriesArr = categories.split(',');
    if(categoriesArr.length >= 0){
        const isInvalidCategories = categoriesArr.some((category) => !categoriesFallback.includes(category));
        if(isInvalidCategories) return res.status(400).json({ error: 'Categories is invalid' });
    } else {
        categoriesArr = categoriesFallback;
    }

    

    launchChromeAndRunLighthouse(url, device, categoriesArr).then(results => {
        console.log(`Lighthouse Test: ${url} - ${device} - ${categories}`);
        const data = {
            url,
            device,
            categories: categoriesArr,
            results: {
                performance: JSON.parse(results).categories?.performance?.score || undefined,
                accessibility: JSON.parse(results).categories?.accessibility?.score || undefined,
                'best-practices': JSON.parse(results).categories?.['best-practices']?.score || undefined,
                seo: JSON.parse(results).categories?.seo?.score || undefined,
                pwa: JSON.parse(results).categories?.pwa?.score || undefined,
            },
        };
        res.status(200).json(data);
    });    
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});