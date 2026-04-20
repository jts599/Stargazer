/// <reference types="vite/client" />

declare module 'tz-lookup' {
  export default function timezoneLookup(latitude: number, longitude: number): string;
}
