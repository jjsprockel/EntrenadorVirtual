/// <reference types="vite/client" />

// Raw markdown imports
declare module '*.md?raw' {
  const content: string;
  export default content;
}
