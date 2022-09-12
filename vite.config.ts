import { defineConfig } from "vite";
import swcReact from "vite-plugin-swc-react";
import vitePluginImp from "vite-plugin-imp";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    swcReact(),
    // vitePluginImp({
    //   optimize: true,
    //   libList: [
    //     {
    //       libName: "antd",
    //       libDirectory: "es",
    //       style: (name) => `antd/es/${name}/style`,
    //     },
    //   ],
    // }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 支持内联 JavaScript
      },
    },
  },
  resolve: {
    alias: [{ find: /^~/, replacement: "" }],
  },
  // define: {
  //   // By default, Vite doesn't include shims for NodeJS/
  //   // necessary for segment analytics lib to work
  //   global: {},
  // },
});
