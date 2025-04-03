
// Check if user is on a mobile device
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
};

// Check if user is in the Petra mobile browser
export const isInPetraMobileBrowser = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  const isPetraMobile = 
    userAgent.includes('PetraWallet') || 
    userAgent.includes('Petra Wallet') || 
    window.location.href.includes('petra.app');
  
  return isPetraMobile && isMobileDevice();
};

// Get the current domain for forming deep links
const getCurrentDomain = (): string => {
  if (typeof window === 'undefined') return '';
  
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
};

// Generate a deep link URL for Petra mobile
const generateDeepLinkUrl = (): string => {
  const domain = getCurrentDomain();
  const path = window.location.pathname;
  const search = window.location.search || '';
  
  // Create a unique reference to identify this connection attempt
  const connectionRef = `ref_${Date.now()}`;
  
  // Construct the redirect URL the wallet will use to return
  const redirectUrl = encodeURIComponent(`${domain}${path}${search ? search + '&' : '?'}wallet_connection=${connectionRef}`);
  
  // Form the deep link
  return `https://petra.app/connect?redirectUrl=${redirectUrl}`;
};

// Redirect to Petra mobile app with deep link
export const redirectToPetraMobile = (): void => {
  if (typeof window === 'undefined') return;
  
  const deepLink = generateDeepLinkUrl();
  console.log("Redirecting to Petra mobile with deep link:", deepLink);
  
  // For iOS, we need to use window.location to ensure proper deep linking
  if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)) {
    window.location.href = deepLink;
    return;
  }
  
  // For Android and other platforms, we open in a new tab/window
  window.open(deepLink, '_blank');
};

// Check if URL has wallet connection parameters
export const hasWalletCallbackParams = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.has('wallet_connection') || 
         searchParams.has('address') || 
         searchParams.has('publicKey');
};

// Extract wallet address from URL if present
export const getWalletAddressFromURL = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const searchParams = new URLSearchParams(window.location.search);
  
  // First check for direct address parameter
  if (searchParams.has('address')) {
    return searchParams.get('address');
  }
  
  // Then check for publicKey parameter
  if (searchParams.has('publicKey')) {
    return searchParams.get('publicKey');
  }
  
  return null;
};

// Clean wallet connection parameters from URL
export const cleanWalletParamsFromURL = (): void => {
  if (typeof window === 'undefined' || !window.history) return;
  
  try {
    const url = new URL(window.location.href);
    
    // Parameters to remove
    const paramsToRemove = [
      'wallet_connection', 
      'address', 
      'publicKey'
    ];
    
    let changed = false;
    
    // Remove each parameter if it exists
    paramsToRemove.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
        changed = true;
      }
    });
    
    // Only update history if changes were made
    if (changed) {
      window.history.replaceState({}, document.title, url.toString());
      console.log("Cleaned wallet parameters from URL");
    }
  } catch (error) {
    console.error("Error cleaning URL parameters:", error);
  }
};
