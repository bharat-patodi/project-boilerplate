import Express from "express"
import {Express as ExpressI } from "express-serve-static-core";
import StaticServe from "serve-static"
import path, { join } from "path";
import { config } from "dotenv";
import { expand } from "@emmetio/expand-abbreviation"
import * as hdd from "fs";
import send from "send";
import { express as UserAgent } from "express-useragent";
import "./utils/modules.declaration";
import faker from "faker";
import { clientModuleLoadTest } from "./tests/server";

declare const mdd;

      // Configure basic environment
      // Import contents of the .env into process.env
      config({ debug: true });
const fsBasePath = join(process.cwd(), `/dist`);
const fs = "mdd" in global ? mdd : hdd;

const service = Express()
      service.use(UserAgent())

      service.get(`/uaseragent`, (req: any, res) => {
        // Recognize user agent
        const ua = req.useragent;
        if (ua.isIE) { return res.send(`It's MS EI!`) }
        if (ua.isEdge) { return res.send(`It's MS Edge!`) }
        if (ua.isChrome) { return res.send(`It's chrome!`) }
        res.type(`html`).send(JSON.stringify(req.useragent))
      })

      service.get(`/`, async function(req, res, next) {
           res.status(200)

          // const  basicStyle = `font-family: system-ui, sans-serif`;
          let index, assets, assetsjs;
          const scriptTemplate = (n) => `<script charset="utf-8" async="true" src="${n}"></script>`;
          try {
            index     = fs.readFileSync(join(fsBasePath, `public/index.html`))
            index     = index.toString().replace(`{{data}}`, `I came from from primary server!`)

            // Prepare for scripts insertion
            assets    = fs.readFileSync(join(fsBasePath, `public/assets.json`))
            assets    = JSON.parse(assets);
            assetsjs  = Object.getOwnPropertyNames(assets)
              .filter((chunkName) => /(bundle|vendors)/.test(chunkName))
              .sort((chunkName) => {
                return /vendors/.test(chunkName) ? -1 : 1
              })
              .map((chunkName) => assets[chunkName].js);
            assetsjs

            // Serving polyfills conditionally
            req.useragent.isIE && (assetsjs.unshift(`/public/polyfills.js`))
            index     = index.replace(`{{scripts}}`, assetsjs.map(scriptTemplate).join(`\n`));
            assets    = assetsjs = void 0;
          } catch (error) {
            index = `
                <h2>Server: Error occured while forming index  response :(</h2>
                <pre>${error.message}</pre>
              `;
          }
          res.type(`html`);
          res.send(index);
       })

      service.get(`/fake/lorem`, function (req, res) {
        res.type(`text`);
        res.send(expand(`lorem`));
      });

      service.get(`/fake/lorem/:length`, function (req, res, next) {
        if (req.url.length > 32) { return res.status(400).send() }
        if (req.params.length) {
          const length = parseInt(req.params.length, 10);
          if (Number.isNaN(length) || length > 127) {
            return res.status(400).send()          }
          res.type(`text`);
          res.send(expand(`lorem${length.toString()}`))
        } else {
          next()
        }
      })

      service.get(`/fake`, function (req, res, next) {
        const data = {
          title   : faker.commerce.productName(),
          content : faker.lorem.paragraph(),
          img     : `http://lorempixel.com/1024/768/`
        }
        res.type(`json`).send(data);
      })
      service.get(`/assets`, (req, res, next) => {
        // Assets json must be generated by webpack!
        send(req, join(fsBasePath, `./public/assets.json`), { fs }).pipe(res)
      });

      service.use(`/public`, StaticServe(join(fsBasePath, `/public`), { fs, index: false } as any));

      // clientModuleLoadTest()

export { service }
export const host = `localhost`;
export const port = 80;

if (process.env.NODE_ENV === "production") {
  service.listen(port, host, () => console.log(`Production server is running...`))
} else if (!module.parent) {
  console.log(`WARNING: You are attempting to run server in development mode!`);
}

