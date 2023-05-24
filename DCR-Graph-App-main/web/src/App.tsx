import { ToastProvider } from 'react-toast-notifications';
import { CollaboratorServerProvider } from './helpers/CollaboratorServerProvider';
import { SwarmProvider } from './helpers/SvarmProvider';
import { ServerConnectionProvider } from './helpers/ServerConnectionProvider';
import Layout from "./components/Layout";


declare global {
  interface Window { electron: any; }
}

function App() {
  return (
    <ToastProvider>
      <ServerConnectionProvider>
        <CollaboratorServerProvider>
          <SwarmProvider>
            <Layout />
          </SwarmProvider>
        </CollaboratorServerProvider>
      </ServerConnectionProvider>
    </ToastProvider>
  );
}

export default App;
