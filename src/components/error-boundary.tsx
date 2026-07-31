import type { ReactNode } from "react";
import { Component } from "react";
import { ErrorFallback } from "@/components/error-fallback";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo): void {
    // Error logging can be added here in the future (e.g., sending to error tracking service)
  }

  resetError = (): void => {
    this.setState({ error: null, hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback error={this.state.error} resetError={this.resetError} />
      );
    }

    return this.props.children;
  }
}
