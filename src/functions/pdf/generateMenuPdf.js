import puppeteer from "puppeteer";
import buildMenuHtml from "./buildMenuHtml.js";

const generateMenuPdf = async (menuData) => {
  const html = buildMenuHtml(menuData);

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1.5cm",
        bottom: "2cm",
        left: "1.8cm",
        right: "1.8cm",
      },
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
