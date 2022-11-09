const app = require("express")();
const cors = require("cors");

let chrome = {};
let puppeteer;
app.use(cors({ origin: '*' }));

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
  var a = 1;
} else {
  puppeteer = require("puppeteer");
  console.log(2);
  var a = 2;
}

app.get("/api", async (req, res) => {
  const { url } = req.query;
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: false,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage(); 
    await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0');
    await page.goto('https://saveinsta.app/en1');
    

    await page.type('#s_input',url);
    await Promise.all([page.click('.btn.btn-default')]);

    await page.waitForSelector('.download-items__btn');
    const image = await page.evaluate(() => document.querySelector(".download-items__thumb img").getAttribute("src"));
    const info = await page.evaluate(() => document.querySelector(".download-items__btn a").getAttribute("href"));
    // const dl720 = await page.evaluate(() => document.querySelector(".link.link-download").getAttribute("href"));
    // const doc = await page.evaluate(() => document.body.innerHTML);

    res.status(200).json({ status: 'success',  image: image });
    // res.send(`<img src='${image}' alt='photo'>`);

  } catch (error) {
    res.send(`<h1>${error}</h1>`);
    console.log(error);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
