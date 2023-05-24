import path from "path";
import { app, BrowserWindow, Menu, ipcMain } from "electron";
import isDev from "electron-is-dev";

import init from "./init";
import { initSwarm } from "./swarm";
import { initCollaborationServer } from "./collaboratorServer";
import { initClient } from "./collaboratorClient";

import { saveGraph, saveAsGraph, loadGraph, newGraph, getGraphFiles, loadSpecific, deleteGraph, loadNetwork, saveNetworkFile, saveLastSearchedFile } from "./fsInteraction";

import { State, isState } from "types";
import { APP_GRAPH_PATH, APP_NETWORK_PATH } from "./constants";

let globalMainWindow: BrowserWindow;
let globalState: State = "LandingPage";

const WINDOW_TITLE = "DCR Graph App";

let autosaveInterval: NodeJS.Timeout;

function createWindow() {
  // Create the browser window.
  globalMainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.resolve(path.join("build", "preload.js")),
    }
  });
  if (isDev) globalMainWindow.webContents.openDevTools();

  globalMainWindow.maximize();
  
  globalMainWindow.loadURL(
    isDev
      ? "http://localhost:"+process.argv[2]
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
 
  ipcMain.on("state", (event: unknown, msg: unknown) => {
    if (isState(msg)) {
      globalState = msg;
      if (msg === "LandingPage") {
        globalMainWindow.setTitle(WINDOW_TITLE);
      }
      if (msg === "Canvas") {
        autosaveInterval = setInterval(() => {
          saveGraph(globalMainWindow);
        }, 1000 * 360); // Every five minutes
      } else {
        clearInterval(autosaveInterval);
      }
      setupMenu();
    } 
  });

  ipcMain.on('getGraphFiles', (event: unknown, msg: unknown)=> {
    const graphFns = getGraphFiles();
    globalMainWindow.webContents.send('graphFiles', graphFns);
  }) 

  ipcMain.on('load', (event: unknown, msg: unknown) => {
    if (typeof msg === "string") {
      loadSpecific(globalMainWindow, path.join(APP_GRAPH_PATH, msg));
    }
  })
  ipcMain.on('loadNetwork', (event: unknown, msg: unknown) => {
    if (typeof msg === "string") {
      loadNetwork(globalMainWindow, path.join(APP_NETWORK_PATH, msg));
    }
  })
  ipcMain.on('saveNetwork', (event: unknown, msg: unknown) =>{
    if (typeof msg === "string") {
      saveNetworkFile(globalMainWindow, msg);
    }
  })
  ipcMain.on('saveLastSearched', (event: unknown, msg: unknown) =>{
    if (typeof msg === "string") {
      saveLastSearchedFile(globalMainWindow, msg);
    }
  })
  ipcMain.on('delete', (event: unknown, msg: unknown) => {
    if (typeof msg === "string") {
      deleteGraph(globalMainWindow, path.join(msg));
    }
  })

  ipcMain.on('newGraph', () => {
    newGraph(globalMainWindow, false);
  })

  init();
  initSwarm(globalMainWindow);
  initCollaborationServer(globalMainWindow)
  initClient(globalMainWindow) 
  setupMenu();
  globalMainWindow.setTitle(WINDOW_TITLE);
}

function setupMenu() {
  const applicationMenuTemplate = [
    {
      label: 'File',
      submenu: [
          { label: 'New',
            accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
            enabled: globalState === "Canvas",
            click: () => newGraph(globalMainWindow, true)
          },
          { 
            label: 'Open',
            accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
            enabled: globalState === "Canvas",
            click: () => loadGraph(globalMainWindow)
          },
          { 
            label: 'Save',
            accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
            enabled: globalState === "Canvas",
            click: () => saveGraph(globalMainWindow) 
          },
          { 
            label: 'Save As',
            accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
            enabled: globalState === "Canvas",
            click: () => saveAsGraph(globalMainWindow) 
          }
      ]
    },
    {
      label: 'Help',
      submenu: [
          isDev ? { label: 'Open Dev Tools',
            accelerator: process.platform === 'darwin' ? 'Shift+Cmd+I' : 'Ctrl+Shift+I',
            click: () => { globalMainWindow.webContents.openDevTools(); } 
          } : {}
      ]
    },
  ]
  
  const applicationMenu = Menu.buildFromTemplate(applicationMenuTemplate)
  Menu.setApplicationMenu(applicationMenu)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});