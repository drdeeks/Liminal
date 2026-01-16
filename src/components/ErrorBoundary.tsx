import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-black">
          <div className="bg-red-900/50 border-2 border-red-500 text-white p-8 rounded-lg max-w-lg text-center">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-lg mb-4">The game encountered an unexpected error.</p>
            {this.state.error && (
              <pre className="text-sm bg-black/50 p-4 rounded overflow-auto max-h-40 text-left">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => {
                try {
                  window.location.reload();
                } catch (error) {
                  console.error('Failed to reload:', error);
                }
              }}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
