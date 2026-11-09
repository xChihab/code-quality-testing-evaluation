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
        <div className="m-5 rounded border border-solid border-[#ff0000] bg-[#ffebee] p-5">
          <h2 className="text-2xl font-bold">Something went wrong!</h2>
          <pre className="whitespace-pre-wrap text-[#ff0000]">{this.state.error && this.state.error.toString()}</pre>
          <button
            onClick={() => window.location.reload()}
            className="cursor-pointer rounded border-none bg-[#f44336] px-4 py-2 text-white"
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
