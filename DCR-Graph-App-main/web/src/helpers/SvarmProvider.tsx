import React, { useState, createContext, useContext, useEffect } from "react";

import { Change, isChange, SwarmContextType } from "types";

const SwarmContext = createContext<SwarmContextType>({
  changes: {}, 
  acceptChange: (graphId: string, changeId: string) => null,
  sendChange: (graphId: string, change: Change) => null,
});

export const SwarmProvider: React.FC = ( { children } ) =>  {
  
  const [changes, setChanges] = useState<{[graphId: string]:  Array<Change>;}>({});
 
  useEffect(() => {
    window.electron.listenToChanges( (msg: string) => {
      const obj = JSON.parse(msg);
      console.log("recevied: " + msg);
      const graphId = obj.graphId;
      if (isChange(obj.change)) {
        const changesCp = {...changes};
        if (!changesCp[graphId]) {
          changesCp[graphId] = []
        }
        changesCp[graphId].push(obj.change);
        setChanges(changesCp);
        console.log("Changes now: " + JSON.stringify(changesCp));
      }
      
    });
    return () => {
      window.electron.clearChangeListener();
    }
  }, [changes])

  const acceptChange = (graphId: string, changeId: string) => {
    const i = changes[graphId].findIndex((change) => change.id === changeId);
    if (i !== -1) {
      console.log(i);
      const newChanges = {...changes};
      newChanges[graphId].splice(i, 1);
      setChanges(newChanges);
      console.log("changes now: " + JSON.stringify(newChanges));
    }
  }

  const sendChange = (graphId: string, change: Change) => {
    const payload = {graphId, change};
    window.electron.broadcastChange(payload);
  }

  return (
    <SwarmContext.Provider value={{ changes, acceptChange, sendChange }}>
      {children}
    </SwarmContext.Provider>
  )
}

export const useSwarmContext = (): SwarmContextType => {
  return useContext(SwarmContext);
};