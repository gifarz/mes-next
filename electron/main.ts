import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import * as url from "url";
import http from "http";
import getPort from "get-port";
import { spawn } from "child_process";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

async function waitForUrl(targetUrl: string, timeoutMs = 30000) {
    const start = Date.now();
    const check = (): Promise<void> =>
        new Promise((resolve, reject) => {
            const req = http.get(targetUrl, (res) => {
                res.resume();
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
                    resolve();
                } else {
                    setTimeout(() => {
                        if (Date.now() - start > timeoutMs) reject(new Error("Timeout"));
                        else check().then(resolve).catch(reject);
                    }, 300);
                }
            });
            req.on("error", () => {
                setTimeout(() => {
                    if (Date.now() - start > timeoutMs) reject(new Error("Timeout"));
                    else check().then(resolve).catch(reject);
                }, 300);
            });
            req.end();
        });
    return check();
}

async function createWindow(startUrl: string | { file: string }) {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "My Next + Electron App",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });

    // Open external links in the user's default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    if (typeof startUrl === "string") {
        await waitForUrl(startUrl).catch(() => { }); // dev/prod server might take a moment
        await mainWindow.loadURL(startUrl);
    } else {
        await mainWindow.loadFile(startUrl.file);
    }

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }

    mainWindow.on("closed", () => (mainWindow = null));
}

async function startNextProd(): Promise<string> {
    const port = await getPort({ port: 3000 }); // pick free port, prefer 3000
    const appPath = app.getAppPath(); // in prod, this resolves inside asar
    const cwd = app.isPackaged
        ? appPath // packaged app root (contains .next if included in "files")
        : process.cwd();

    // Start Next with the production build
    const child = spawn(
        process.execPath, // use the packaged Node runtime
        [path.join(cwd, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(port)],
        {
            cwd,
            env: { ...process.env, NODE_ENV: "production" },
            stdio: "inherit",
        }
    );

    // Optionally: handle child exit
    child.on("exit", (code) => {
        if (code !== 0) console.error("next start exited with code", code);
    });

    return `http://localhost:${port}`;
}

app.on("ready", async () => {
    if (isDev) {
        await createWindow("http://localhost:3000");
    } else {
        const startUrl = await startNextProd();
        await createWindow(startUrl);
    }
});

app.on("ready", async () => {
    // The URL or file to load will be decided by Track A or Track B (below).
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (mainWindow === null) {
        // Recreate on mac dock click
    }
});

// Example IPC
ipcMain.handle("ping", () => "pong");
