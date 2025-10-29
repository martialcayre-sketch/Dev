import * as React from 'react';

type FormErrorProps = {
  id: string;
  children: React.ReactNode;
};

export function FormError({ children, id }: FormErrorProps) {
  if (!children) return null;

  return (
    <p id={id} aria-live="polite" className="text-sm font-medium text-destructive">
      {children}
    </p>
  );
}
