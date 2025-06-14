
import React from "react";

/**
 * Simple error boundary for React components.
 * Usage: Wrap children that might throw. Displays fallback UI on error.
 */
type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  errorInfo: string | null;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error?.toString() || "Unknown error" };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col justify-center items-center py-20">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong in the game area.</h2>
          <p className="text-sm bg-red-100 p-4 rounded text-red-800 max-w-lg break-all">
            {this.state.errorInfo}
          </p>
          <p className="mt-2 text-gray-500 text-xs">Try refreshing or starting a new game!</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
