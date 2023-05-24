import { app } from "electron";
import path from "path";

export const APP_DATA_PATH = path.join(app.getPath("appData"), "DCR-Tool"); 

export const APP_GRAPH_PATH = path.join(APP_DATA_PATH, "graphs");
export const APP_NETWORK_PATH = path.join(APP_DATA_PATH, "network");