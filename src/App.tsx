import { SorokitProvider } from './context/SorokitProvider';
import { useSorokit } from './context/useSorokit';
import type { SorokitClient } from './lib/client';
import { ConnectScreen } from './screens/ConnectScreen';
import { Dashboard } from './screens/Dashboard';

interface AppProps {
  client: SorokitClient;
}

function AppContent() {
  const { isConnected } = useSorokit();

  if (!isConnected) {
    return <ConnectScreen />;
  }

  return <Dashboard />;
}

function App({ client }: AppProps) {
  return (
    <SorokitProvider client={client}>
      <AppContent />
    </SorokitProvider>
  );
}

export default App;
