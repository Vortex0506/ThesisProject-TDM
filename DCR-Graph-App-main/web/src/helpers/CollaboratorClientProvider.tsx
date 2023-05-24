import React, { createContext, useContext } from "react";

import { Invite, CollaboratorClientContextType } from "types";

const CollaboratorClientContext = createContext<CollaboratorClientContextType>({
  sendInvite: (invite) => null
});

export const CollaboratorClientProvider: React.FC = ( { children } ) =>  { 
  const sendInvite = (invite: Invite) => {
    window.electron.sendInvite(invite);
  }
  return (
    <CollaboratorClientContext.Provider value={{ sendInvite }}>
      {children}
    </CollaboratorClientContext.Provider>
  )
}

export const useCollaboratorClientContext = (): CollaboratorClientContextType => {
  return useContext(CollaboratorClientContext);
};