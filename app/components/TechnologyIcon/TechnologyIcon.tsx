import type { SVGProps } from 'react';

export type Technology =
  | 'vitex'
  | 'vite'
  | 'router'
  | 'react'
  | 'redux'
  | 'express';

type TechnologyIconProps = SVGProps<SVGSVGElement> & { kind: Technology };

export const TechnologyIcon = ({ kind, ...props }: TechnologyIconProps) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}>
    {kind === 'react' ? (
      <>
        <ellipse cx="16" cy="16" rx="14" ry="5.5" />
        <ellipse
          cx="16"
          cy="16"
          rx="14"
          ry="5.5"
          transform="rotate(60 16 16)"
        />
        <ellipse
          cx="16"
          cy="16"
          rx="14"
          ry="5.5"
          transform="rotate(120 16 16)"
        />
        <circle cx="16" cy="16" r="2.5" fill="currentColor" stroke="none" />
      </>
    ) : kind === 'vite' ? (
      <path
        d="m18 2-13 17h9l-1 11L27 12h-9l3-10Z"
        fill="currentColor"
        stroke="none"
      />
    ) : kind === 'router' ? (
      <>
        <path d="M6 23h7a5 5 0 0 0 5-5v-4a5 5 0 0 1 5-5h3" />
        <circle cx="6" cy="23" r="4" fill="currentColor" stroke="none" />
        <circle cx="26" cy="9" r="4" fill="currentColor" stroke="none" />
        <circle cx="10" cy="8" r="4" fill="currentColor" stroke="none" />
        <circle cx="25" cy="24" r="4" fill="currentColor" stroke="none" />
      </>
    ) : kind === 'redux' ? (
      <>
        <path d="M9 24C0 19 5 7 15 9m-1-2c4-9 15-3 13 8m0 4c3 10-12 14-17 7" />
        <circle cx="16" cy="9" r="3" />
        <circle cx="27" cy="17" r="3" />
        <circle cx="8" cy="24" r="3" />
      </>
    ) : kind === 'express' ? (
      <text
        x="2"
        y="23"
        fill="currentColor"
        stroke="none"
        fontFamily="sans-serif"
        fontSize="23"
        letterSpacing="-2">
        ex
      </text>
    ) : (
      <path
        d="m3 8 9 18L29 6h-8L13 17 9 8Z"
        fill="currentColor"
        stroke="none"
      />
    )}
  </svg>
);
