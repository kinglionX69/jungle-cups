
// Detect if the user is on a mobile device
export const isMobileDevice = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  return /android|iPad|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
};

// Check if the app is running inside Petra browser
export const isInPetraMobileBrowser = (): boolean => {
  const userAgent = navigator.userAgent || "";
  return userAgent.includes("PetraWallet") || userAgent.includes("Petra/");
};

// Generate deep link to open Petra mobile app with current URL
export const getPetraMobileDeepLink = (): string => {
  // Encode the current URL to be used in the deep link
  const currentUrl = encodeURIComponent(window.location.href);
  return `petra://wallet/dapp?url=${currentUrl}`;
};

// Generate universal link format for iOS
export const getPetraUniversalLink = (): string => {
  const currentUrl = encodeURIComponent(window.location.href);
  return `https://petra.app/explore?link=${currentUrl}`;
};

// Redirect to Petra mobile app
export const redirectToPetraMobile = () => {
  console.log("Redirecting to Petra mobile app");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Use the appropriate link format based on platform
  const deepLink = getPetraMobileDeepLink();
  const universalLink = getPetraUniversalLink();
  
  console.log("Current URL:", window.location.href);
  console.log("Deep link:", deepLink);
  console.log("Universal link:", universalLink);
  
  // For iOS, use universal link, for Android use deep link
  const linkToOpen = isIOS ? universalLink : deepLink;
  console.log("Opening link:", linkToOpen);
  
  // Open the link
  window.location.href = linkToOpen;
  
  // Fallback to app store after a delay
  const timeout = setTimeout(() => {
    // Check if the page is still visible (means the app didn't open)
    if (!document.hidden) {
      console.log("App didn't open, redirecting to app store");
      window.location.href = isIOS 
        ? "https://apps.apple.com/app/petra-aptos-wallet/id6446259840"
        : "https://play.google.com/store/apps/details?id=com.petra.wallet";
    }
  }, 2000);
  
  // Clear the timeout if the page visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearTimeout(timeout);
      console.log("App opened, clearing timeout");
    }
  }, { once: true });
};

// Check for wallet callback parameters in URL
export const hasWalletCallbackParams = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('petra_wallet_callback') || urlParams.has('walletAddress');
};

// Get wallet address from URL parameters
export const getWalletAddressFromURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('walletAddress');
};
