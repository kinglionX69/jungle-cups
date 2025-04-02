
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
  // Format: petra://wallet/dapp?url={encodedUrl}
  return `petra://wallet/dapp?url=${currentUrl}`;
};

// Redirect to Petra mobile app
export const redirectToPetraMobile = () => {
  const deepLink = getPetraMobileDeepLink(window.location.href);
  
  // Attempt to open the Petra mobile app
  window.location.href = deepLink;
  
  // If the user doesn't have Petra installed, we'll redirect to the app store after a delay
  const timeout = setTimeout(() => {
    // Check if we're still on the same page
    if (document.hidden || document.visibilityState === "hidden") {
      // User switched to the app, don't do anything
      return;
    }
    
    // Redirect to the website to download the app
    window.location.href = "https://petra.app/";
  }, 2000);
  
  // Clear the timeout if the page visibility changes (indicating the app opened)
  document.addEventListener("visibilitychange", () => {
    clearTimeout(timeout);
  }, { once: true });
};
