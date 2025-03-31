
// Type definitions for the Aptos wallet window object
interface Window {
  aptos?: {
    connect: () => Promise<{ address: string }>;
    disconnect: () => Promise<void>;
    account: () => Promise<{ address: string }>;
    isConnected: () => Promise<boolean>;
    signAndSubmitTransaction: (transaction: any) => Promise<any>;
    signTransaction: (transaction: any) => Promise<any>;
    signMessage: (message: any) => Promise<any>;
  };
}
