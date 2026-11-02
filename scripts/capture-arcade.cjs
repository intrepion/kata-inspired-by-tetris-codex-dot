'use strict';
const { chromium } = require('playwright');
const { mkdir, readFile, writeFile } = require('node:fs/promises');
const { createHash } = require('node:crypto');
const path = require('node:path');
(async () => {
  const output = process.env.CAPTURE_OUTPUT || '/tmp/stacklight-captures';
  const site = process.env.CAPTURE_SITE || 'capture-site';
  await mkdir(output, { recursive: true });
  const inputs = {};
  for (const file of ['index.html','style.css','game.js']) inputs[file] = createHash('sha256').update(await readFile(path.join(site,file))).digest('hex');
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1,locale:'en-US',reducedMotion:'reduce'});
    await page.addInitScript(() => {let seed=1989; Math.random=()=>((seed=(seed*16807)%2147483647)-1)/2147483646;});
    await page.goto('http://127.0.0.1:4174/',{waitUntil:'networkidle'});
    await page.getByRole('button',{name:/start game/i}).click();
    await page.locator('#overlay').waitFor({state:'hidden'});
    for (const key of ['ArrowLeft','ArrowLeft','Space','ArrowRight','ArrowRight','Space','ArrowLeft','Space']) await page.keyboard.press(key);
    await page.locator('section.game').screenshot({path:path.join(output,'stack-01.png'),animations:'disabled'});
    for (const key of ['ArrowRight','Space','ArrowLeft','ArrowLeft','Space','ArrowRight','Space']) await page.keyboard.press(key);
    await page.locator('section.game').screenshot({path:path.join(output,'stack-02.png'),animations:'disabled'});
    await writeFile(path.join(output,'capture.json'),JSON.stringify({schemaVersion:1,workflowCommit:process.env.GITHUB_SHA||null,sourceCommit:process.env.GAME_SOURCE_COMMIT||null,runId:process.env.GITHUB_RUN_ID||null,url:'http://127.0.0.1:4174/',inputs,browser:browser.version(),viewport:{width:1280,height:900},seed:1989,screenshots:['stack-01.png','stack-02.png']},null,2)+'\n');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
