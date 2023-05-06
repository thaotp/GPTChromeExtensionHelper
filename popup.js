const authenticationTextArea = document.getElementById("authenticationTextArea");

// const savedText = localStorage.getItem("authenticationContentGPT");

// if (savedText) {
//   authenticationTextArea.value = savedText;
// }

// authenticationTextArea.addEventListener("input", function () {
//   const text = authenticationTextArea.value;
//   localStorage.setItem("authenticationContentGPT", text);
// });

// Load saved text from storage
chrome.storage.sync.get(["authenticationContentGPT"], function (result) {
  if (result.authenticationContentGPT) {
    authenticationTextArea.value = result.authenticationContentGPT;
  }
});

// Save new text to storage on input
authenticationTextArea.addEventListener("input", function () {
  const text = authenticationTextArea.value;
  chrome.storage.sync.set({ "authenticationContentGPT": text });
});