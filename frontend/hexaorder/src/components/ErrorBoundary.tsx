import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null; }

const isDev = import.meta.env.DEV;

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
        >
          <div
            className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
            style={{ animation: 'modalIn 0.3s ease' }}
          >
            <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-16px) } to { opacity:1; transform:translateY(0) } }`}</style>

            {/* Red accent stripe */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-500 to-red-400" />

            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-5">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>

              <h1 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Something went wrong
              </h1>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                We encountered an unexpected error. Your data is safe — try refreshing the page.
              </p>

              {isDev && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 hover:text-slate-700 transition-colors">
                    Developer Details
                  </summary>
                  <pre className="text-xs bg-slate-900 text-red-400 p-4 rounded-xl overflow-auto max-h-40 leading-relaxed">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleReset}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/dashboard')}
                  leftIcon={<Home className="w-4 h-4" />}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}