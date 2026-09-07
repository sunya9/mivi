/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="unplugin-fonts/client" />

interface ImportMetaEnv {
  readonly VITE_APP_VERSION: string;
  readonly VITE_BUILD_DATETIME: string;
}
