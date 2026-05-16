import * as Icons from './icons';

// Loading States
export function LoadingSpinner({ size = 20 }: { size?: number }) {
  return (
    <Icons.Loader2
      size={size}
      className="animate-spin text-fg-muted"
    />
  );
}

export function LoadingPage({ message = 'Loading...', progress }: { message?: string; progress?: number }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <LoadingSpinner size={32} />
      <p className="text-sm text-fg-muted">{message}</p>
      <div className="w-48 h-1 bg-bg-hover rounded-full overflow-hidden">
        {progress != null ? (
          <div
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        ) : (
          <div className="h-full bg-accent rounded-full animate-[loading-bar_1.4s_ease-in-out_infinite]" />
        )}
      </div>
      {progress != null && (
        <p className="text-xs text-fg-dim">{Math.round(progress)}%</p>
      )}
    </div>
  );
}

export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-bg-hover rounded ${className}`} />
  );
}

// Error States
interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-danger/10">
        <Icons.AlertCircle size={24} className="text-danger" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-fg mb-1">{title}</h3>
        <p className="text-sm text-fg-muted max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm">
          <Icons.Refresh size={14} />
          Try again
        </button>
      )}
    </div>
  );
}

export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-danger/10 border border-danger/20 rounded-lg">
      <Icons.AlertCircle size={16} className="text-danger flex-shrink-0" />
      <p className="flex-1 text-sm text-fg">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-fg-muted hover:text-fg transition-colors"
        >
          <Icons.X size={16} />
        </button>
      )}
    </div>
  );
}

// Empty States
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-bg-hover text-fg-dim">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-fg mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-fg-muted max-w-md">{description}</p>
        )}
      </div>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary btn-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}

// Info Banner
export function InfoBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-accent-soft border border-accent/20 rounded-lg">
      <Icons.Info size={16} className="text-accent flex-shrink-0" />
      <p className="flex-1 text-sm text-fg">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-fg-muted hover:text-fg transition-colors"
        >
          <Icons.X size={16} />
        </button>
      )}
    </div>
  );
}

// Success Banner
export function SuccessBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-success/10 border border-success/20 rounded-lg">
      <Icons.Check size={16} className="text-success flex-shrink-0" />
      <p className="flex-1 text-sm text-fg">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-fg-muted hover:text-fg transition-colors"
        >
          <Icons.X size={16} />
        </button>
      )}
    </div>
  );
}

// Made with Bob
