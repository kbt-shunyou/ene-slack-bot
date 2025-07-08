const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');

const SLACK_WEBHOOK_URL = 'あなたのSlack Webhook URL';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://kankyo-ichiba.jp/kyusyu', { waitUntil: 'networkidle2' });

  // グラフ画像のスクショ
  const graphSelector = '.market-graph img';
  await page.waitForSelector(graphSelector);
  const graphElement = await page.$(graphSelector);
  await graphElement.screenshot({ path: 'graph.png' });

  // 単価取得
  const minSelector = '.market-tomorrow .market-price-min';
  const maxSelector = '.market-tomorrow .market-price-max';

  await page.waitForSelector(minSelector);
  const minPrice = await page.$eval(minSelector, el => el.textContent.trim());
  const maxPrice = await page.$eval(maxSelector, el => el.textContent.trim());

  await browser.close();

  // Slack通知（グラフ画像付き）
  const formData = {
    text: `📊 *環境市場（九州）明日分の電気料金*\n\n🔻最安単価：${minPrice}\n🔺最高単価：${maxPrice}`,
  };

  const image = fs.readFileSync('graph.png');

  // Slackへ画像投稿（multipart/form-data）
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', image, {
    filename: 'graph.png',
    contentType: 'image/png',
  });
  form.append('initial_comment', formData.text);
  form.append('channels', '#your-channel-name');

  await axios.post('https://slack.com/api/files.upload', form, {
    headers: {
      ...form.getHeaders(),
      Authorization: 'Bearer あなたのSlackボットトークン'
    }
  });
})();
