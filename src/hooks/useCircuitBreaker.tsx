
import { useState, useCallback, useRef } from 'react';

interface CircuitBreakerOptions {
  maxFailures: number;
  resetTimeout: number;
  cooldownTime: number;
}

export const useCircuitBreaker = (options: CircuitBreakerOptions) => {
  const [state, setState] = useState<'closed' | 'open' | 'half-open'>('closed');
  const [failureCount, setFailureCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastFailureTime = useRef<number>(0);

  const execute = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | null> => {
    console.log(`🔄 CIRCUIT BREAKER: Current state: ${state}, Processing: ${isProcessing}`);
    
    // Prevent multiple simultaneous operations
    if (isProcessing) {
      console.log("⚠️ CIRCUIT BREAKER: Operation already in progress");
      throw new Error("Operation already in progress");
    }

    // Check if circuit is open
    if (state === 'open') {
      const timeSinceLastFailure = Date.now() - lastFailureTime.current;
      if (timeSinceLastFailure < options.resetTimeout) {
        console.log("❌ CIRCUIT BREAKER: Circuit is open, operation blocked");
        throw new Error("Circuit breaker is open. Please wait before retrying.");
      } else {
        console.log("🔄 CIRCUIT BREAKER: Moving to half-open state");
        setState('half-open');
      }
    }

    setIsProcessing(true);
    
    try {
      console.log("▶️ CIRCUIT BREAKER: Executing operation");
      const result = await operation();
      
      // Success - reset circuit
      console.log("✅ CIRCUIT BREAKER: Operation successful, resetting circuit");
      setState('closed');
      setFailureCount(0);
      
      return result;
    } catch (error) {
      console.error("❌ CIRCUIT BREAKER: Operation failed:", error);
      
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);
      lastFailureTime.current = Date.now();
      
      if (newFailureCount >= options.maxFailures) {
        console.log("🚨 CIRCUIT BREAKER: Max failures reached, opening circuit");
        setState('open');
      }
      
      throw error;
    } finally {
      // Add cooldown before allowing next operation
      setTimeout(() => {
        setIsProcessing(false);
      }, options.cooldownTime);
    }
  }, [state, failureCount, isProcessing, options]);

  const reset = useCallback(() => {
    console.log("🔄 CIRCUIT BREAKER: Manual reset");
    setState('closed');
    setFailureCount(0);
    setIsProcessing(false);
  }, []);

  return {
    execute,
    reset,
    state,
    failureCount,
    isProcessing
  };
};
