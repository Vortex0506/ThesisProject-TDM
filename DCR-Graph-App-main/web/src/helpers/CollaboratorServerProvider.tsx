import React, { useState, createContext, useContext, useEffect } from "react";

import { Invite, CollaboratorServerContextType, isInvite } from "types";

const CollaboratorServerContext = createContext<CollaboratorServerContextType>({
  invites: [], 
  consumeInvite: (graphId) => null,
});

export const CollaboratorServerProvider: React.FC = ( { children } ) =>  {
  const [invites, setInvites] = useState<Array<Invite>>([]);
 
  useEffect(() => {
    window.electron.listenToInvites( (msg: string) => {
      const obj = JSON.parse(msg);
      if (isInvite(obj)) {
        setInvites([...invites, obj]);
      }
    });
    return () => {
      window.electron.clearInviteListener();
    }
  }, [invites])

  const consumeInvite = (graphId: string) => {
    const invitesCp = [...invites];
    const i = invitesCp.findIndex( (inv) => inv.uiDCRGraphId === graphId);
    if (i !== -1) {
      invitesCp.splice(i, 1);
      setInvites(invitesCp);
    }
  }
  
  return (
    <CollaboratorServerContext.Provider value={{ invites, consumeInvite }}>
      {children}
    </CollaboratorServerContext.Provider>
  )
}

export const useCollaboratorServerContext = (): CollaboratorServerContextType => {
  return useContext(CollaboratorServerContext);
};