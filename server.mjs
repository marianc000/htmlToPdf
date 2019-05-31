//import express from 'express';
const express = require('express');
var bodyParser = require('body-parser');
//import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');
//import ssr from './ssr.mjs';
const ssr = require('./ssr.mjs');

let browserWSEndpoint = null;
const app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
const port = 3000;

async function serveRequest(req, res, next) {
  if (!browserWSEndpoint) {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    browserWSEndpoint = await browser.wsEndpoint();
  }

 
  //  const url = `${req.protocol}://${req.get('host')}/index.html`;
  const url = "http://localhost:8080/CohortExplorer/report.html";
  const { pdf, ttRenderMs } = await ssr(url, browserWSEndpoint,req.body);
  // Add Server-Timing! See https://w3c.github.io/server-timing/.
  res.set('Server-Timing', `Prerender;dur=${ttRenderMs};desc="Headless render time (ms)"`);
  //  return res.status(200).send(html); // Serve prerendered page as response.
  return res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length }).send(pdf)

}

app.get('/', serveRequest); 
app.post('/', serveRequest);

app.listen(port, () => console.log('Server started. Press Ctrl+C to quit'));