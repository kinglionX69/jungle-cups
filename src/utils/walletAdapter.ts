
// Re-export the custom hook as the main interface
export { useAptosWallet } from "@/hooks/useAptosWallet";

// Export wallet provider for App.tsx
export { default as WalletProvider } from "@/providers/WalletProvider";

// Custom styled wallet components
export { default as WalletConnect } from "@/components/WalletConnect";
export { default as WalletConnected } from "@/components/wallet/WalletConnected";
export { default as WalletNotInstalled } from "@/components/wallet/WalletNotInstalled";
