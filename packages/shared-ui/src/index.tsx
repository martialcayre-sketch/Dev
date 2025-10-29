import React from 'react';

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: '#eef2ff',
      color: '#3730a3',
      borderRadius: 9999,
      fontSize: 12,
      fontWeight: 600,
    }}>{children}</span>
  );
}

