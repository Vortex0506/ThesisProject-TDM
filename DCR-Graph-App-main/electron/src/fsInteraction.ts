import { ipcMain, dialog, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";

import { saveFile, loadFile } from "./fileManipulation";

import { UiDCRGraph, isUiDCRGraph, ObjectToSave } from "types";

import { APP_GRAPH_PATH, APP_NETWORK_PATH } from "./constants";

import { v4 as uuidv4 } from 'uuid';

let globalLastFilePath: string = ""; 

const addToast = (mainWindow: BrowserWindow, msg: string, appearance: "success" | "error") => {
  mainWindow.webContents.send('toast', {msg, appearance});
}

export const getGraphFiles = (): Array<string> => {
  const fns = fs.readdirSync(APP_GRAPH_PATH);
  const graphFns = fns.filter( (fn) => fn.endsWith(".json"));
  return graphFns
}

export function getGraph(mainWindow: BrowserWindow): Promise<UiDCRGraph> {
  return new Promise( (resolve, reject) => {
    ipcMain.once("graph", (event, msg) => {
      const objecToSave = JSON.parse(msg);
      if (isUiDCRGraph(objecToSave.graphUi)) {
        resolve(objecToSave);
      } else {
        reject(new Error("Invalid graph received"));
      }
    })
    mainWindow.webContents.send("getGraph");
  })
}

export function getObjectToSave(mainWindow: BrowserWindow): Promise<ObjectToSave> {
  return new Promise( (resolve, reject) => {
    ipcMain.once("graph", (event, msg) => {
      const objectToSave = JSON.parse(msg);
      if (isUiDCRGraph(objectToSave.graphUi)) {
        resolve(objectToSave);
      } else {
        reject(new Error("Invalid graph received"));
      }
    })
    mainWindow.webContents.send("getGraph");
  })
}

export const saveAsGraph = async (mainWindow: BrowserWindow) => {
  const defaultFn = globalLastFilePath ? globalLastFilePath : "graph.json";
  const res = await dialog.showSaveDialog(mainWindow, {
    title: "Select graph",
    defaultPath: path.join(APP_GRAPH_PATH, defaultFn),
    properties: ['showOverwriteConfirmation']
  });
  if (!res.canceled && res.filePath) {
    await saveGraph(mainWindow, res.filePath);
    globalLastFilePath = res.filePath;
  }
}

export const saveGraph = async (mainWindow: BrowserWindow, filePath?: string) => {
  //change graph to data
  const objectToSave = await getObjectToSave(mainWindow);
 
  const trueFilePath = filePath ? filePath : globalLastFilePath;

  // If no filename saved, create dialog
  if (!trueFilePath) {
    await saveAsGraph(mainWindow);
    return
  }

  try {
    await saveFile(trueFilePath, objectToSave);
    addToast(mainWindow, "Graph Saved!", "success");
  } catch (e) {
    console.log(e);
    addToast(mainWindow, "Error saving graph", "error");
  }
}
export const saveNetworkFile = async (mainWindow: BrowserWindow, content: string) =>{
  var splitContent = content.split(',');
  var contentArray = {id:splitContent[0], name:splitContent[1]}
  try {
    await saveFile(path.join(APP_NETWORK_PATH,'networking.json'), contentArray);
    addToast(mainWindow, "Network file updated!", "success");
  }catch(e){
    console.log(e);
    addToast(mainWindow, "Error updating network file.", "error");
  }
}
export const saveLastSearchedFile = async (mainWindow: BrowserWindow, content: string) =>{
  var splitContent = content.split(',');
  var contentArray = {id:splitContent[0], name:splitContent[1]}
  try {
    await saveFile(path.join(APP_NETWORK_PATH,'lastSearched.json'), contentArray);
    addToast(mainWindow, "Network file updated!", "success");
  }catch(e){
    console.log(e);
    addToast(mainWindow, "Error updating network file.", "error");
  }
}

export const loadSpecific = async (mainWindow: BrowserWindow, filepath: string) => {
  let objectToLoad; //change to set data type
  try {
    objectToLoad = await loadFile(filepath);
  } catch (e) {
    addToast(mainWindow, "Invalid graph...", "error");
    return
  }
  if (isUiDCRGraph(objectToLoad.graphUi)) {
    //check can be the same but send set
    mainWindow.webContents.send('showGraph', objectToLoad);
    globalLastFilePath = filepath;
    mainWindow.setTitle(path.basename(filepath).slice(0, -5));
  } else {
    addToast(mainWindow, "Invalid graph...", "error");
  }
} 
export const loadNetwork = async (mainWindow: BrowserWindow, filepath: string) => {
  let networkFile;
  try {
    networkFile = await loadFile(filepath);
    mainWindow.webContents.send('listenToNetwork', networkFile);
  } catch (e) {
    addToast(mainWindow, "No network file found.", "error");
    return
  }
}

export const loadGraph = async (mainWindow: BrowserWindow) => {
  const res = await dialog.showOpenDialog(mainWindow, {
    title: "Select graph",
    defaultPath: APP_GRAPH_PATH,
    properties: ['openFile']
  });
  if (!res.canceled) {
    const filepath = res.filePaths[0];
    loadSpecific(mainWindow, filepath);
  }
}

export const newGraph = async (mainWindow: BrowserWindow, prompt?: boolean) => {
  let response = 0;
  if (prompt) {
    response = dialog.showMessageBoxSync(mainWindow, {
      message: "Creating a new graph will erase all unsaved progress. Do you want to continue?",
      type: "question",
      buttons: ["Yes", "No"]
    });
  }
  if (response === 0) {
    const graph = {
      id: uuidv4(),
      events: [],
      relations: []
    }
    mainWindow.webContents.send('showGraph', graph);
    globalLastFilePath = "";
    mainWindow.setTitle("New Graph");
  }
}

export const deleteGraph = (mainWindow: BrowserWindow, fn: string) => {
  const response = dialog.showMessageBoxSync(mainWindow, {
    message: "This will delete the graph forever. Do you wish to continue?",
    type: "question",
    buttons: ["Yes", "No"]
  })
  if (response == 0) {
    fs.rm(path.join(APP_GRAPH_PATH, fn), (err) => {
      if (err) {
        addToast(mainWindow, "Error deleting graph: " + fn.slice(0, -4), "error");
      } else {
        const fns = getGraphFiles();
        addToast(mainWindow, "Graph deleted", "success");
        mainWindow.webContents.send('graphFiles', fns);
      }
    });
  }
}