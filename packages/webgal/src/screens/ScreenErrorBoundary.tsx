import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logger } from '@/Core/util/logger';
import type { UiScreenId } from '@/screens/contracts';

interface ScreenErrorBoundaryProps {
  screen: UiScreenId;
  resetKey: string;
  fallback: ReactNode;
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ScreenErrorBoundaryState {
  hasError: boolean;
}

/**
 * Isolates rendering errors inside custom or variant screens and falls back to the
 * built-in default screen implementation.
 */
export class ScreenErrorBoundary extends Component<ScreenErrorBoundaryProps, ScreenErrorBoundaryState> {
  public state: ScreenErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ScreenErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidUpdate(prevProps: ScreenErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.warn(`Screen "${this.props.screen}" threw during render; falling back to built-in default.`, error);
    this.props.onError?.(error, info);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
