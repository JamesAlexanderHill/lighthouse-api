const express = require("express");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const desktopConfig = require('./configs/desktop');
const mobileConfig = require('./configs/mobile');

const app = express();
const PORT = 3000;

const launchChromeAndRunLighthouse = (url, device, categories) => {
    return chromeLauncher.launch({
        logLevel: "info",
        chromeFlags: [
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
        ]}).then(chrome => {
        console.log('chromeLauncher')
        const options = {onlyCategories: categories, port: chrome.port, logLevel: "info",};
        const config = device === 'mobile' ? mobileConfig : desktopConfig;

        return lighthouse(url, options, config).then(results => {
            console.log('lighthouse')
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

    console.log(`Testing... ${url} - ${device} - ${categories}`);
    launchChromeAndRunLighthouse(url, device, categoriesArr).then(results => {
        console.log(`Finished:  ${url} - ${device} - ${categories}`);
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