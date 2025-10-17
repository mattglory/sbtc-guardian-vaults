import { Component } from 'react';
import { AlertCircle } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-400" size={32} />
              <h1 className="text-2xl font-bold text-red-400">Something went wrong</h1>
            </div>
            <p className="text-gray-300 mb-4">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            <details className="bg-gray-900/50 rounded-lg p-4 mb-4">
              <summary className="cursor-pointer text-sm text-gray-400 mb-2">Error details</summary>
              <pre className="text-xs text-red-300 overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
