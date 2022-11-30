const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

//routes map
// const instagramRoutes = require("./routes/instagram.js");

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
  var a = 1;
} else {
  puppeteer = require("puppeteer");
  console.log(2);
  var a = 2;
}

// app.use('/instagram', instagramRoutes);

app.get("/api", async (req, res) => {
  const { url } = req.query;
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }
    
    const source = "https://vidinsta.app/";
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    // await page.setDefaultNavigationTimeout(60000);
    // page.setJavaScriptEnabled(false);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0');
    await page.goto(source);
    
    //find input form
    await page.waitForSelector('.form-control');
    //type to input form
    await page.type('.form-control',url);
    //click download button
    await Promise.all([page.click('.submit-download')]);
    
    try {
      
      //wait for result element
      await page.waitForSelector('.result img'/*, { timeout: 2000 }*/);
    
      const mediaPreview = await page.evaluate(() => Array.from(document.querySelectorAll('.result img'), element => 'https://vidinsta.app' + element.getAttribute('src')));
      const mediaType = await page.evaluate(() => Array.from(document.querySelectorAll('.result .item-download .col-xs-8.text-center'), element => element.textContent));
      const mediaLink = await page.evaluate(() => Array.from(document.querySelectorAll('.result .item-download .col-xs-4.text-center a'), element => element.getAttribute('href')));
      res.status(200).json({ medias: mediaPreview, types: mediaType, links: mediaLink });
    
    } catch (error) {

      res.status(400).json({ message: error.name });

    }
    
    await browser.close();
  });

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
