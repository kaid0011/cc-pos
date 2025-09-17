import { createApp } from "vue";
import { createPinia } from "pinia";
import { Quasar, Dialog, Notify } from "quasar";
import router from "./router";

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/fontawesome-v5/fontawesome-v5.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";

import "quasar/src/css/index.sass";
import "./style.css";

import App from "./App.vue";


const myApp = createApp(App);
myApp.use(Quasar, {
  plugins: {
    Dialog,
    Notify,
  },
});

const pinia = createPinia();
myApp.use(pinia);

// Use router
myApp.use(router);
   
myApp.mount("#app");