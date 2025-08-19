import { app, BrowserWindow, ipcMain, shell } from "electron";
import * as path from "path";
import http from "http";
import getPort from "get-port";
import { spawn } from "child_process";

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;
let externalProcess: ReturnType<typeof spawn> | null = null;

async function waitForUrl(targetUrl: string, timeoutMs = 30000) {
    const start = Date.now();
    const check = (): Promise<void> =>
        new Promise((resolve, reject) => {
            const req = http.get(targetUrl, (res) => {
                res.resume();
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
                    resolve();
                } else {
                    retry();
                }
            });
            req.on("error", retry);
            req.end();

            function retry() {
                setTimeout(() => {
                    if (Date.now() - start > timeoutMs) reject(new Error("Timeout"));
                    else check().then(resolve).catch(reject);
                }, 300);
            }
        });
    return check();
}

async function createWindow(startUrl: string) {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "IMES Platform",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false, // allow IPC
        },
    });

    // Open external links in system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: "deny" };
    });

    await waitForUrl(startUrl).catch(() => { });
    await mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools({ mode: "detach" });
    }

    mainWindow.on("closed", () => (mainWindow = null));
}

async function startNextProd(): Promise<string> {
    const port = await getPort({ port: 3000 });
    const appPath = app.getAppPath();

    const nextBinary = path.join(
        appPath,
        "node_modules",
        "next",
        "dist",
        "bin",
        "next"
    );

    const child = spawn(process.execPath, [nextBinary, "start", "-p", String(port)], {
        cwd: appPath,
        env: { ...process.env, NODE_ENV: "production" },
        stdio: "inherit",
    });

    child.on("exit", (code) => {
        if (code !== 0) console.error("next start exited with code", code);
    });

    return `http://localhost:${port}`;
}

// 🚀 Launch external exe
function startExternalExe() {
    const exePath = isDev
        ? path.join(__dirname, "../resources/IMES-Platform.exe") // dev path
        : path.join(process.resourcesPath, "IMES-Platform.exe"); // prod path

    try {
        externalProcess = spawn(exePath, [], {
            detached: true,
            stdio: "ignore",
        });
        externalProcess.unref();
        console.log("IMES-Platform started:", exePath);
    } catch (err) {
        console.error("Failed to start IMES-Platform.exe:", err);
    }
}

app.on("ready", async () => {
    startExternalExe();

    if (isDev) {
        await createWindow("http://localhost:3000");
    } else {
        const startUrl = await startNextProd();
        await createWindow(startUrl);
    }
});

// Clean up external exe when quitting
app.on("before-quit", () => {
    if (externalProcess) {
        try {
            externalProcess.kill();
        } catch { }
    }
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (mainWindow === null) {
        // recreate window on macOS dock click
    }
});

// Example IPC
ipcMain.handle("ping", () => "pong");
