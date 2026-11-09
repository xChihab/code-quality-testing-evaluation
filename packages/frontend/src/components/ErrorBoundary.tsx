import React, { type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-5 m-5 border border-solid border-[#ff0000] rounded bg-[#ffebee]">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <pre className="whitespace-pre-wrap text-[#ff0000]">{this.state.error && this.state.error.toString()}</pre>
          <button
            onClick={() => window.location.reload()}
            className="py-2 px-4 bg-[#f44336] text-white border-none rounded cursor-pointer"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
