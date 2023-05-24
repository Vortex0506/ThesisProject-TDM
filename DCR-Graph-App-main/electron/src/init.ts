import fs from "fs";
import path from "path";

import { APP_DATA_PATH, APP_GRAPH_PATH, APP_NETWORK_PATH } from "./constants";

export default function init() {
    if (!fs.existsSync(APP_DATA_PATH)) {
        fs.mkdirSync(APP_DATA_PATH, { recursive: true});
    }
    if (!fs.existsSync(APP_GRAPH_PATH)) {
        fs.mkdirSync(APP_GRAPH_PATH, { recursive: true});
    }
    if (!fs.existsSync(APP_NETWORK_PATH)) {
        fs.mkdirSync(APP_NETWORK_PATH, { recursive: true});
        const Networkfile = path.join(APP_NETWORK_PATH, 'networking.json');
        const LastSearchedfile = path.join(APP_NETWORK_PATH, 'lastSearched.json');
        if (!fs.existsSync(Networkfile)){
            fs.writeFileSync(Networkfile,'');
        }
        if(!fs.existsSync(LastSearchedfile)){
            fs.writeFileSync(LastSearchedfile, '');
        }
    }
}