import Swarm from "discovery-swarm";
import defaults from "dat-swarm-defaults";
import getPort from "get-port";
import { v4 as uuidv4 } from 'uuid';

import { isChange, Change } from "types";

import { BrowserWindow, ipcMain } from "electron";

import { getGraph } from "./fsInteraction";

let globalMainWindow: BrowserWindow;

export const initSwarm = (mainWindow: BrowserWindow) => {
  globalMainWindow = mainWindow;
}

type PeersDict = {
  [graphId: string]: {
    [peerId: string]: {
      conn: any;
      seq: number;
    }
  }
}

// List of all connected channels, and the peers also in them
let peers: PeersDict = {}
// Counter for connections, used for identify connections
let connSeq = 0
// Peer Identity, a random hash for identify your peer
const myId = uuidv4();
/** 
 * Default DNS and DHT servers
 * This servers are used for peer discovery and establishing connection
 */
const config = defaults({
  // peer-id
  id: myId,
  keepExistingConnections: true
})

/**
 * discovery-swarm library establishes a TCP p2p connection and uses
 * discovery-channel library for peer discovery
 */
// Choose a random unused port for listening TCP peer connections

function broadcastChange(graphId: string, change: Change) {
  if (isChange(change)) {
    for (const peerId in peers[graphId]) {
      peers[graphId][peerId].conn.write(JSON.stringify(change));
    }
  }
}

export const joinCollaboration = async (graphId: string, initiator: boolean = false) => {
  // If already connected to this channel, return
  console.log(graphId);
  console.log(JSON.stringify(peers));
  if (peers[graphId]) {
    console.log("CAUGHT DUPLICATE JOINCOLLABORATION");
    return;
  }
  const sw = Swarm(config)
  const port = await getPort();
  console.log('Listening to port: ' + port);
  sw.listen(port);
  sw.join(graphId);
  peers[graphId] = {};
  sw.on('connection', async (conn: any, info: any) => {
    // Connection id
    const seq = connSeq
    const peerId = info.id as string;
    console.log(`Connected #${seq} to peer: ${peerId}`)
    // Keep alive TCP connection with peer
    if (info.initiator) {
      try {
        conn.setKeepAlive(true, 600)
      } catch (exception) {
        console.log('exception', exception)
      }
    }
    conn.on('data', (data: any) => {
      // Here we handle incomming messages
      const obj = JSON.parse(data);
      if (isChange(obj) && globalMainWindow) {
          globalMainWindow.webContents.send('changes', JSON.stringify({ graphId: graphId, change: obj}));
      }
    })
    conn.on('close', () => {
      // Here we handle peer disconnection
      console.log(`Connection ${seq} closed, peer id: ${peerId}`)
      // If the closing connection is the last connection with the peer, removes the peer
      if (peers[graphId][peerId].seq === seq) {
        delete peers[graphId][peerId]
      }
    })
    peers[graphId][peerId] = { conn, seq };
    connSeq++
    if (initiator) {
      // Broadcast initial graph state
      const graph = await getGraph(globalMainWindow);
      const change: Change = {
        id: uuidv4(),
        userId: myId,
        timestamp: new Date(),
        payload: [{
          object: graph,
          type: "graph",
          removed: false
        }]
      }
      console.log("Trying to broadcast initial graph");
      broadcastChange(graph.id, change);
    }
  });
}
ipcMain.on('broadcast', (event, msg) => {
  const payload = JSON.parse(msg);
  broadcastChange(payload.graphId, payload.change);
});
