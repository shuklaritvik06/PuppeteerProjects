require("dotenv").config();
const puppeteer = require("puppeteer");
const fs = require("fs");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");
const url = "https://coinmarketcap.com/currencies/bitcoin/";

async function configBrowser(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  return page;
}

async function getData(page) {
  await page.reload();
  let price = await page.$eval(".priceValue", (el) => el.textContent);
  if(price>="$19,100" && price<="$19,900"){
    sendEmail(price);
  }
}

async function get(url) {
  const page = await configBrowser(url);
  const job = new CronJob(
    "*/20 * * * *",
    getData(page),
    null,
    true
  );
  job.start();
}

function sendEmail(price) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
    }
  });
  let message = {
    from: process.env.EMAIL,
    to:   process.env.EMAIL,
    subject: 'Bitcoin price is low',
    text: 'Bitcoin price is low' + price,
    html: fs.readFileSync("./emailTemplate.html").toString()
  }
  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.messageId);
    }
  });
}

get(url);
