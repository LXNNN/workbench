/* 个人工作台 - 本地启动服务
   作用：用 http://localhost 方式打开工作台，保证真实热榜数据接口全部畅通。
   使用：双击「启动工作台.bat」即可，无需手动运行本文件。 */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");

const PORT = 8390;
const ROOT = __dirname;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon"
};

function lanIP(){
  const ifs = os.networkInterfaces();
  for (const name in ifs){
    for (const n of ifs[name]){
      if (n.family === "IPv4" && !n.internal) return n.address;
    }
  }
  return null;
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const file = path.join(ROOT, path.normalize(urlPath).replace(/^([.][.][\\/])+/, ""));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, {"Content-Type": "text/plain; charset=utf-8"}); res.end("404 Not Found"); return; }
    res.writeHead(200, {"Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream"});
    res.end(buf);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  const url = "http://127.0.0.1:" + PORT + "/";
  const ip = lanIP();
  console.log("");
  console.log("  ================================================");
  console.log("   个人工作台已启动！");
  console.log("   本机访问：" + url);
  if (ip) console.log("   手机访问（同一WiFi）：http://" + ip + ":" + PORT + "/");
  console.log("   使用期间请不要关闭本窗口（最小化即可）");
  console.log("  ================================================");
  console.log("");
  exec('start "" "' + url + '"');
});

server.on("error", (e) => {
  if (e.code === "EADDRINUSE") {
    console.log("工作台已经在运行中，直接打开浏览器即可。");
    exec('start "" "http://127.0.0.1:' + PORT + '/"');
    setTimeout(()=>process.exit(0), 3000);
  } else {
    console.error("启动失败：", e.message);
  }
});
