import puppeteer from "puppeteer-core";
import fs from "node:fs";
import buildMenuHtml from "./buildMenuHtml.js";

const getChromiumPath = () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
  ];
  for (const path of candidates) {
    if (fs.existsSync(path)) return path;
  }
  return undefined;
};

const generateMenuPdf = async (menuData) => {
  const html = buildMenuHtml(menuData);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: getChromiumPath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "1.5cm", bottom: "2cm", left: "1.8cm", right: "1.8cm" },
      displayHeaderFooter: true,
      headerTemplate: "<div></div>",
      footerTemplate: `
        <div style="width: 100%; font-size: 8pt; color: #6B6B6B; text-align: center; padding: 0 1.8cm;">
          Plano Alimentar · página <span class="pageNumber"></span> de <span class="totalPages"></span>
        </div>
      `,
    });

    return buffer;
  } finally {
    await browser.close();
  }
};

export default generateMenuPdf;
