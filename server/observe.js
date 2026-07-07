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
  await new Promise(r => setTimeout(r, 5000));
  
  console.log("Typing credentials...");
  await page.type('input[name="username"]', 'intanmutia419@yahoo.com');
  await page.type('input[name="password"]', '12345678');
  
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const loginBtn = btns.find(b => b.textContent.toLowerCase().includes('masuk') || b.textContent.toLowerCase().includes('login') || b.type === 'submit');
    if (loginBtn) loginBtn.click();
  });
  
  console.log("Clicked login, waiting 15s for dashboard to load...");
  await new Promise(r => setTimeout(r, 15000));
  
  await page.screenshot({ path: path.join(__dirname, 'dashboard.png') });
  console.log("Saved dashboard.png");
  
  // Dump some inner text to understand the nav menu
  const navText = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button, [role="menuitem"]')).map(el => el.innerText.trim()).filter(t => t.length > 0);
  });
  console.log("Possible navigation items:", [...new Set(navText)]);

  await browser.close();
  console.log("Done");
}

run().catch(console.error);
