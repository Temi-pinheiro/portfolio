// Shared by the Mariposa page (a client component) and the case pages (server
// components), so it lives outside both: a server component that imports a
// plain value from a 'use client' module gets a reference, not the value.
export const primaryButton =
  'inline-flex min-h-[52px] items-center rounded-full bg-accent px-7 font-mono text-[15px] font-semibold tracking-[0.02em] text-on-accent transition-[translate,scale] duration-300 ease-soft hover:-translate-y-0.5 active:scale-[0.97]';
