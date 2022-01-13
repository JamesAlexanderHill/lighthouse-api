const express = require("express");
const chromeLauncher = require("chrome-launcher");
const lighthouse = require("lighthouse");
const urlExists = require('url-exists');


const desktopConfig = require('./configs/desktop');
const mobileConfig = require('./configs/mobile');

const app = express();
const PORT = 3000;

const launchChromeAndRunLighthouse = (url, device, categories) => {
    return chromeLauncher.launch({
        chromeFlags: [
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
        ]}).then(chrome => {
        const options = {onlyCategories: categories, port: chrome.port};
        const config = device === 'mobile' ? mobileConfig : desktopConfig;

        return lighthouse(url, options, config).then(results => {
            return chrome.kill().then(() => results.report);
        });
    });
};

app.get('/', (req, res) => res.status(200).json({status: 'online'}));
app.get('/score', async (req, res) => {
    const {url, device, categories} = req.query;
    if (!device || !(device == 'mobile' || device == 'desktop')) return res.status(400).json({ error: 'Device is invalid' });

    urlExists(url, (err, exists) => {
        if(err) return res.status(400).json({ message: 'Unable to verify URL', err });
        if(!exists) return res.status(400).json({ error: 'URL is invalid' });

        //check if categories are valid
        const categoriesFallback = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
        let categoriesArr = categories.split(',');
        if(categoriesArr.length >= 0){
            const isInvalidCategories = categoriesArr.some((category) => !categoriesFallback.includes(category));
            if(isInvalidCategories) return res.status(400).json({ error: 'Categories is invalid' });
        } else {
            categoriesArr = categoriesFallback;
        }

        // Get score
        launchChromeAndRunLighthouse(url, device, categoriesArr).then(results => {
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
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});