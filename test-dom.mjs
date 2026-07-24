import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('https://sistem-cp.vercel.app', { waitUntil: 'networkidle2' });
  const html = await page.content();
  console.log(html);
  await browser.close();
})();
