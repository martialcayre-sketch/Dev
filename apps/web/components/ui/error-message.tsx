import * as React from 'react';

type ErrorMessageProps = {
  message: string;
  className?: string;
};

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className={`rounded-md bg-destructive/15 p-3 ${className}`}>
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
