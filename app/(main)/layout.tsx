import '@/app/globals.css';
import RootContent from './RootContent';
import React from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RootContent>{children}</RootContent>;
}
