import puppeteer from 'puppeteer';
import pc from 'picocolors';

const BASE_URL = 'http://localhost:3000';
const VIEWPORT_MOBILE = { width: 360, height: 740 };
const VIEWPORT_DESKTOP = { width: 1280, height: 800 };

const PAGES_TO_TEST = [
  '/login',
  '/register',
  '/reset-password',
  '/profile',
  '/tenant/profile',
];

async function checkHorizontalScroll(page) {
  return await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

async function runTests() {
  console.log(pc.cyan('🚀 Starting Responsive Tests for Ticket 26...\n'));
  
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    let allPassed = true;

    for (const route of PAGES_TO_TEST) {
      const url = `${BASE_URL}${route}`;
      console.log(pc.blue(`Testing route: ${route}`));

      try {
        await page.goto(url, { waitUntil: 'networkidle0' });

        // TC-26-01 & TC-26-02: Mobile Viewport
        await page.setViewport(VIEWPORT_MOBILE);
        
        // Give it a moment to reflow
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const hasMobileScroll = await checkHorizontalScroll(page);
        
        if (hasMobileScroll) {
          console.log(pc.red(`  ❌ FAILED at 360px: Horizontal scrolling detected.`));
          allPassed = false;
        } else {
          console.log(pc.green(`  ✅ PASSED at 360px: No horizontal scrolling.`));
        }

        // TC-26-02: Desktop Viewport
        await page.setViewport(VIEWPORT_DESKTOP);
        
        // Give it a moment to reflow
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const hasDesktopScroll = await checkHorizontalScroll(page);
        if (hasDesktopScroll) {
          console.log(pc.red(`  ❌ FAILED at 1280px: Horizontal scrolling detected.`));
          allPassed = false;
        } else {
          console.log(pc.green(`  ✅ PASSED at 1280px: No horizontal scrolling.`));
        }

      } catch (err) {
        console.log(pc.red(`  ❌ ERROR visiting ${route}: ${err.message}`));
        allPassed = false;
      }
      console.log('---');
    }

    if (allPassed) {
      console.log(pc.bgGreen(pc.black('\n 🎉 ALL RESPONSIVE TESTS PASSED (Ticket 26) 🎉 \n')));
    } else {
      console.log(pc.bgRed(pc.white('\n ⚠️ SOME TESTS FAILED. Please review the output above. ⚠️ \n')));
      process.exit(1);
    }
    
  } catch (err) {
    console.error(pc.red(`Failed to launch browser: ${err.message}`));
    console.log(pc.yellow('Make sure the dev server is running on http://localhost:3000'));
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

runTests();
