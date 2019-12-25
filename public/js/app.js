// navigator is an boject is js which stores the info about the js
//  is service worker property exists in the navigator, i.e the browser supports the service workers
//  below is an async task
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(reg => console.log("servieWorker rejistered", reg))
    .catch(err => console.log("servieWorker not rejistered ", err));
}


