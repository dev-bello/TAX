import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/20 p-8 text-center">
            <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-error" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h2>
            <p className="text-on-surface-variant mb-6">
              We apologize for the inconvenience. Please try reloading the page.
            </p>
            {this.state.error && (
              <div className="bg-surface-container-high rounded-xl p-4 mb-6 text-left overflow-auto">
                <p className="text-sm font-mono text-error">{this.state.error.message}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 py-3 rounded-xl font-semibold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} /> Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
