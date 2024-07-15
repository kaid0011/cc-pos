import { createApp, watch } from "vue";
import { Quasar, Dialog, Notify } from "quasar";
import router from "./router";
import i18n from "./i18n"; // Import the i18n instance

// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/fontawesome-v5/fontawesome-v5.css";
import "@quasar/extras/fontawesome-v6/fontawesome-v6.css";

import "quasar/src/css/index.sass";
import "./style.css";

import App from "./App.vue";
import quasarLangEn from 'quasar/lang/en-US';
import quasarLangZh from 'quasar/lang/zh-CN';

const myApp = createApp(App);

// Function to dynamically set Quasar language
const setQuasarLang = (lang) => {
  let quasarLang;
  switch(lang) {
    case 'zh':
      quasarLang = quasarLangZh;
      break;
    default:
      quasarLang = quasarLangEn;
  }
  myApp.use(Quasar, {
    lang: quasarLang,
    plugins: {
      Dialog,
      Notify,
    }
  });
};

// Set default Quasar language
setQuasarLang('en');

// Watch for changes in i18n locale
watch(
  () => i18n.global.locale,
  (newLocale) => {
    setQuasarLang(newLocale);
  }
);

// Use i18n
myApp.use(i18n);

// Use router
myApp.use(router);

myApp.mount("#app");
