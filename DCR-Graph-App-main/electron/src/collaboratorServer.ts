import net from "net";
import getPort from "get-port";
import { IpPort, isInvite } from "types";
import { BrowserWindow, ipcMain } from "electron";
import { joinCollaboration } from "./swarm";
import { saveAsGraph } from "./fsInteraction";
import ip from "ip";

let globalMainWindow: BrowserWindow;

export const initCollaborationServer = (mainWindow: BrowserWindow) => {
  globalMainWindow = mainWindow;
}
 
const server = net.createServer();

getPort().then(serverPort => {
  const ipAddress = ip.address();
  server.listen({
    host: ip.address(),
    port: serverPort
  }, () => {
    console.log('Open port listening: ' + serverPort);  
  })
  
  server.on("connection", (client) => { 
    console.log('opened server on %j', server.address()); 
    console.log("new client connection is made", client.remoteAddress + ":" + client.remotePort); 
    client.on("data", (data: any) => { 
      const obj = JSON.parse(data);
      if (isInvite(obj) && globalMainWindow) {
        console.log("Recieved invite for " + obj.uiDCRGraphId)
        globalMainWindow.webContents.send('invite', JSON.stringify(obj));
      }
    }); 
    client.once("close", () => { 
      console.log("client connection closed."); 
    }); 
    client.on("error", (err) => { 
      console.log("client connection got errored out.") 
    });
  }); 
  
  ipcMain.on('accept', (event, msg) => {
    const obj = JSON.parse(msg);
    if(isInvite(obj)) {
      console.log("accept");
      joinCollaboration(obj.uiDCRGraphId);
      saveAsGraph(globalMainWindow);
    }
  });

  ipcMain.on('getIpPort', (event, msg) => {
    const payload: IpPort = {
      ip: ipAddress,
      port: serverPort
    }
    globalMainWindow.webContents.send('ipPort', JSON.stringify(payload));
  })

  
}).catch((e) => {
  console.log("CHOKING ERROR:");
  console.log(e);
});
