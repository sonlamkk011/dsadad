/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly env: ImportMetaEnv
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  interface Window {
    ethereum: any;
  }