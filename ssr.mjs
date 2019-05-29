//import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');
//import urlModule from 'url';
const urlModule = require('url');
const URL = urlModule.URL;


async function ssr(url, browserWSEndpoint,reqBody) {
console.log("cohorts="+reqBody.cohorts);
//console.log("html="+reqBody.html);

    const start = Date.now();

    console.info('Connecting to existing Chrome instance.'+browserWSEndpoint);
    const browser = await puppeteer.connect({ browserWSEndpoint });
    const page = await browser.newPage();

    // // 1. Intercept network requests.
    // await page.setRequestInterception(true);

    // page.on('request', req => {
    //   // 2. Ignore requests for resources that don't produce DOM
    //   // (images, stylesheets, media).
    //   const whitelist = ['document', 'script', 'xhr', 'fetch'];
    //   if (!whitelist.includes(req.resourceType())) {
    //     return req.abort();
    //   }

    //   // 3. Pass through all other requests.
    //   req.continue();
    // });

    //

    //Adding a ?headless parameter to the render URL is a simple way to give the page a hook
    // Add ?headless to the URL so the page has a signal
    // it's being loaded by headless Chrome.
    const renderUrl = new URL(url);
    renderUrl.searchParams.set('headless', '');
    console.log("renderUrl=" + renderUrl);
    try {
        // networkidle0 waits for the network to be idle (no requests for 500ms).
        // The page's JS has likely produced markup by this point, but wait longer
        // if your site lazy loads, etc.
        await page.goto(renderUrl, { waitUntil: 'networkidle0' });
        //   await page.waitForSelector('#posts'); // ensure #posts exists in the DOM.
        const watchDog = page.waitForFunction('reportReady');
    } catch (err) {
        console.error(err);
        throw new Error('page.goto/waitForSelector timed out.');
    }
    await page.evaluate((reqBody) => {
        let dom = document.querySelector('.copyToDownload');
        dom.innerHTML = reqBody.html;
        adjustSvgSize();
        console.log("cohorts2="+reqBody.cohorts);
        setTableValues(reqBody.cohorts);
     },reqBody);
 
    //  const html = await page.content(); // serialized HTML of page DOM.
    const pdf = await page.pdf({ format: 'A4' });


   // await browser.close();

    const ttRenderMs = Date.now() - start;
    console.info(`Headless rendered page in: ${ttRenderMs}ms`);



    //   return { html, ttRenderMs };
    return { pdf, ttRenderMs };
}

//export { ssr as default };
module.exports = ssr;