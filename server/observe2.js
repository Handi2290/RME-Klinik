import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  
  console.log("Navigating to login page...");
  await page.goto('https://clinica.assist.id/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Typing credentials...");
  await page.type('input[name="username"]', 'intanmutia419@yahoo.com');
  await page.type('input[name="password"]', '12345678');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent.toLowerCase().includes('masuk') || b.textContent.toLowerCase().includes('login') || b.type === 'submit');
    if (loginBtn) loginBtn.click();
  });
  
  console.log("Clicked login, waiting for dashboard...");
  await new Promise(r => setTimeout(r, 10000));
  
  // Navigate to Rawat Jalan
  console.log("Navigating to rawatJalan...");
  await page.goto('https://clinica.assist.id/rawatJalan', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'rawat_jalan.png') });
  console.log("Saved rawat_jalan.png");
  
  // Navigate to EMR
  console.log("Navigating to emr...");
  await page.goto('https://clinica.assist.id/emr', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'emr.png') });
  console.log("Saved emr.png");
  
  // Navigate to Settings
  console.log("Navigating to settings...");
  await page.goto('https://clinica.assist.id/settings', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(__dirname, 'settings.png') });
  console.log("Saved settings.png");
  
  await browser.close();
  console.log("Done observing new pages");
}

run().catch(console.error);
