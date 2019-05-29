//import express from 'express';
const express   = require('express');
//import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');
//import ssr from './ssr.mjs';
const ssr = require('./ssr.mjs');

let browserWSEndpoint = null;
const app = express();
const port = 3000;

app.get('/', async (req, res, next) => {
    if (!browserWSEndpoint) {
        const browser = await puppeteer.launch();
        browserWSEndpoint = await browser.wsEndpoint();
    }

  //  const url = `${req.protocol}://${req.get('host')}/index.html`;
  const url="http://localhost:8080/CohortExplorer/report.html";
    const { pdf, ttRenderMs } = await ssr(url, browserWSEndpoint);
    // Add Server-Timing! See https://w3c.github.io/server-timing/.
    res.set('Server-Timing', `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`);
  //  return res.status(200).send(html); // Serve prerendered page as response.
  return res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length }).send(pdf)
});

app.listen(port, () => console.log('Server started. Press Ctrl+C to quit'));