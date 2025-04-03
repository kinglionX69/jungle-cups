
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
export const getPetraMobileDeepLink = (url: string): string => {
  // Encode the current URL to be used in the deep link
  const currentUrl = encodeURIComponent(url || window.location.href);
  return `petra://wallet/dapp?url=${currentUrl}`;
};

// Generate universal link format for iOS
export const getPetraUniversalLink = (url: string): string => {
  const currentUrl = encodeURIComponent(url || window.location.href);
  return `https://petra.app/explore?link=${currentUrl}`;
};

// Redirect to Petra mobile app
export const redirectToPetraMobile = () => {
  console.log("Redirecting to Petra mobile app");
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Get the current URL to pass to the app
  const currentUrl = window.location.href;
  console.log("Current URL:", currentUrl);
  
  // Use universal link for both platforms as it's more reliable
  const universalLink = getPetraUniversalLink(currentUrl);
  console.log("Using universal link:", universalLink);
  
  // Attempt to open the Petra mobile app
  window.location.href = universalLink;
  
  // If the user doesn't have Petra installed, redirect to app store after a delay
  const timeout = setTimeout(() => {
    // Check if we're still on the same page
    if (document.hidden || document.visibilityState === "hidden") {
      // User switched to the app, don't do anything
      console.log("User switched to Petra app");
      return;
    }
    
    console.log("Fallback to app store");
    
    // Redirect to download page based on platform
    if (isIOS) {
      window.location.href = "https://apps.apple.com/app/petra-aptos-wallet/id6446259840";
    } else {
      window.location.href = "https://play.google.com/store/apps/details?id=com.petra.wallet";
    }
  }, 2000);
  
  // Clear the timeout if the page visibility changes (indicating the app opened)
  document.addEventListener("visibilitychange", () => {
    clearTimeout(timeout);
    console.log("Visibility changed, clearing timeout");
  }, { once: true });
};

// Check if specific URL parameters were added by Petra
export const hasWalletCallbackParams = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('petra_wallet_callback') || urlParams.has('walletAddress');
};

// Extract wallet address from URL parameters (if present)
export const getWalletAddressFromURL = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('walletAddress');
};
