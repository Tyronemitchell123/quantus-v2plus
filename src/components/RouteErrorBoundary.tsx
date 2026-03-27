import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Shown in the error UI to give context */
  routeName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Route-level error boundary — wraps individual routes so a crash
 * in one page doesn't take down the entire app.
 */
class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[RouteErrorBoundary${this.props.routeName ? `: ${this.props.routeName}` : ""}]`, error, info.componentStack);
  }

  handleRetry = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="text-destructive" size={24} />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              Page failed to load
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.props.routeName
                ? `The "${this.props.routeName}" page encountered an error.`
                : "This page encountered an unexpected error."}
            </p>
          </div>
          {this.state.error && (
            <pre className="text-left text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3 overflow-auto max-h-24 border border-border">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={14} />
              Retry
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <Home size={14} />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default RouteErrorBoundary;
