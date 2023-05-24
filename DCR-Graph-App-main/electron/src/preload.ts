import { contextBridge, ipcRenderer } from "electron";

import{ State, Change, Invite, isIpPort, IpPort } from "types";

contextBridge.exposeInMainWorld(
    'electron', {
      sendGraph: (graph: string) => ipcRenderer.send('graph', graph),
      listenToGetGraph: (callback: Function) => ipcRenderer.on('getGraph', () => callback()),
      listenToShowGraph: (callback: Function) => ipcRenderer.on('showGraph', (event, msg) => callback(msg)),
      listenToNetwork: (callback: Function) => ipcRenderer.on('listenToNetwork',(event, msg) => callback(msg)),
      listenToSaveNetwork: (callback: Function) => ipcRenderer.on('saveNetwork',(event, msg) => callback(msg)),
      listenTosaveLastSearchedFile: (callback: Function) => ipcRenderer.on('saveLastSearched',(event, msg) => callback(msg)),
      listenToFilepath: (callback: Function) => ipcRenderer.on('filepath', (event, msg) => callback(msg)),
      listenToToast: (callback: Function) => ipcRenderer.on('toast', (event, msg) => callback(msg)),
      setState: (state: State) => ipcRenderer.send('state', state),
      listenToGraphFiles: (callback: Function) => { 
        ipcRenderer.on('graphFiles', (event, msg) => callback(msg)); 
      },
      getGraphFiles: () => {
        ipcRenderer.send('getGraphFiles');
      },
      loadNetwork: (fn: string) =>{
        ipcRenderer.send('loadNetwork', fn);
      },
      saveNetwork: (content: string) => {
        ipcRenderer.send('saveNetwork', content)
      },
      saveLastSearchedFile: (content: string) => {
        ipcRenderer.send('saveLastSearched', content)
      },
      loadGraph: (fn: string) => {
        ipcRenderer.send('load', fn);
      },
      deleteGraph: (fn: string) => {
        ipcRenderer.send('delete', fn);
      },
      newGraph: () => {
        ipcRenderer.send('newGraph', "");
      },

      listenToChanges: (callback: Function) => ipcRenderer.on('changes', (event, msg) => callback(msg)),
      listenToInvites: (callback: Function) => ipcRenderer.on('invite', (invite, msg) => callback(msg)),
      sendInvite: (msg: Invite) => ipcRenderer.send('invite', JSON.stringify(msg)),
      acceptInvite: (msg: any) => ipcRenderer.send('accept', JSON.stringify(msg)),
      broadcastChange: (msg: {graphId: string, change: Change}) => ipcRenderer.send('broadcast', JSON.stringify(msg)),
      getIpPort: () => {
        return new Promise( (resolve, reject) => {
          ipcRenderer.once('ipPort', (event, msg) => {
            const payload = JSON.parse(msg);
            if (isIpPort(payload)) {
              resolve(payload)
            } else {
              reject(new Error("Invalid IP/PORT received"));
            }
          });
          ipcRenderer.send('getIpPort');
        });
      },
      getUsername: () => {
        return new Promise( (resolve, reject) => {
          ipcRenderer.once('listenToNetwork', (event, msg) => {
            if (typeof msg?.name === "string") resolve(msg.name);
            else reject("Couldn't fetch name");
          });
          ipcRenderer.send('loadNetwork', "networking.json");
        });
      },
      clearChangeListener: () => ipcRenderer.removeAllListeners('changes'),
      clearInviteListener: () => ipcRenderer.removeAllListeners('invite'),
      clearGraphListeners: () => {
        ipcRenderer.removeAllListeners('showGraph');
        ipcRenderer.removeAllListeners('getGraph');
        ipcRenderer.removeAllListeners('filepath');
      },
      clearToastListener: () => {
        ipcRenderer.removeAllListeners('toast');
      },
      clearGraphFilesListener: () => {
        ipcRenderer.removeAllListeners('graphFiles');
      },
    }
)