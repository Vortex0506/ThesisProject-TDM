import net from "net";
import getPort from "get-port";
import { isInvite} from "types";
import { BrowserWindow, ipcMain } from "electron";
import { joinCollaboration } from "./swarm";
import { saveGraph } from "./fsInteraction";

let globalMainWindow: BrowserWindow;

export const initClient = (mainWindow: BrowserWindow) => {
  globalMainWindow = mainWindow;
}

getPort().then(port => {
  console.log("Client port " + port);
  ipcMain.on('invite', async (event, msg) => {
    await saveGraph(globalMainWindow);
    const obj = JSON.parse(msg);
    console.log("sending invite");
     if (isInvite(obj)) {
      console.log("client Invite");
      // Sending invite, so ensuring we are already on the channel we invite to
      joinCollaboration(obj.uiDCRGraphId, true);
      const client = net.createConnection({
          host: obj.peerIp, 
          port: parseInt(obj.peerPort) }, () => {
        console.log('CLIENT: I connected to the server.');
        client.write(msg);
        client.destroy();
      });
      
      client.on('end', () => {
        console.log('CLIENT: I disconnected from the server.');
      })
    }
  })

}).catch((e) => {
  console.log("CHOKING ERROR:");
  console.log(e);
});
