const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// SlackのWebhook URL（環境変数から取得）
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.get('/', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://kankyo-ichiba.jp/kyusyu', { waitUntil: 'networkidle2' });

    // 必要な値を抽出
    const minSelector = '.market-tomorrow .market-price-min';
    const maxSelector = '.market-tomorrow .market-price-max';

    await page.waitForSelector(minSelector);
    const minPrice = await page.$eval(minSelector, el => el.textContent.trim());
    const maxPrice = await page.$eval(maxSelector, el => el.textContent.trim());

    await browser.close();

    const message = `📊 *環境市場 九州 明日分の電気料金*\n🔻最安単価: ${minPrice}\n🔺最高単価: ${maxPrice}`;

    // Slackに送信
    await axios.post(SLACK_WEBHOOK_URL, {https://hooks.slack.com/services/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
      text: message,
    });

    console.log('Slack通知を送信しました');
    res.send('Slack通知を送信しました！');
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).send('エラーが発生しました');
  }
});

app.listen(PORT, () => {
  console.log(`サーバー起動中 http://localhost:${PORT}`);
});
