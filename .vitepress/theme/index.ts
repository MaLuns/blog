import { defineTheme } from "vitepress-theme-async";
import Layout from "./components/layout.vue";
import "./styles/index.less";

export default defineTheme({
  Layout: Layout,
  enhanceApp(_ctx) {
    //
  },
});
