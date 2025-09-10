const { app, BrowserWindow } = require("electron");
const path = require("path");
const next = require("next");
const express = require("express");

let mainWindow;
let server;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", async () => {
  // Run Next.js inside Electron instead of spawning node
  const port = 3000;
  const dev = false;
  const nextApp = next({ dev, dir: path.join(__dirname, "..") });
  const handle = nextApp.getRequestHandler();

  await nextApp.prepare();

  const expressApp = express();
  expressApp.all("*", (req, res) => handle(req, res));

  server = expressApp.listen(port, () => {
    console.log(`> Next.js SSR running at http://localhost:${port}`);
    createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
  if (server) server.close();
});
