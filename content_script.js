// // Gửi event từ content script sang background script
// chrome.runtime.sendMessage({eventName: "myEvent", data: "Hello from content script!"}, function(response) {
//     // Nhận phản hồi từ background script (nếu có)
//     console.log(response);
// });

// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//     console.log(response.farewell);
// });
const conversationID = 'c36b4cf9-7c46-4146-8950-d2160fb73c5b'
const styleElement = document.createElement('link');
styleElement.rel = 'stylesheet';
styleElement.type = 'text/css';
styleElement.href = chrome.runtime.getURL('css/popup.css');

const icon = document.createElement('img');
icon.src = chrome.runtime.getURL('./images/diversify.png');
icon.style.position = 'absolute';
icon.style.display = 'none';
icon.style.cursor = 'pointer';
icon.style.zIndex = '9999';
icon.classList.add("gpt-copy-icon");
document.body.appendChild(icon);

const popupRoot = document.createElement('gpt-supporter-popups');
const popup = document.createElement('div');
popup.style.display = 'none';
popup.style.position = 'absolute';
popup.style.border = '1px solid #ccc';
popup.style.borderRadius = '4px';
popup.style.padding = '8px';
popup.style.backgroundColor = '#fff';
popup.style.zIndex = '9999';
popup.classList.add("gpt-popup");
popupRoot.appendChild(styleElement);
popupRoot.appendChild(popup);
document.body.appendChild(popupRoot);


const popupContent = `
<div>
    <div class='gpt-btn-control'>
        <a href='javascript:void(0)' id='gpt-close-btn' class="gpt-close-btn">&times;</a>
    </div>
    <div class='gpt-original-content' id='gptOriginalContent'>
    </div>
    <div class='gpt-result-content' id='gptResultContent'>

    </div>
</div>
`;

function showPopup(event) {


    const selectedText = window.getSelection().toString();
    popup.innerHTML = popupContent;

    const cursorPosition = {
        x: event.clientX,
        y: event.clientY
    };

    popup.style.left = `${cursorPosition.x + window.scrollX}px`;
    popup.style.top = `${cursorPosition.y + window.scrollY - 50}px`;
    popup.style.display = 'block';

    const gptCloseBtn = document.getElementById("gpt-close-btn");
    gptCloseBtn.addEventListener("click", () => {
        hidePopup();
    });

    const errorLink = `<a target="_blank" href='https://chat.openai.com/c/${conversationID}' id='gpt-reload-btn' class="gpt-close-btn">&#8635;</a>`

    const gptOriginalContent = document.getElementById("gptOriginalContent");
    gptOriginalContent.innerText = selectedText
    const gptResultContent = document.getElementById("gptResultContent");
    const preText = 'Translate the following paragraph into 3 languages Japanese, Vietnamese and English: ';
    chrome.runtime.sendMessage({ payload: `${preText} "${selectedText}"` }, function (response) {
        if (response.data) {
            if(response.data === 'error-d2160fb73c5b'){
                gptResultContent.innerHTML = errorLink;
            }else{
                gptResultContent.innerText = response.data;
            }

        }
        if(response.error){
            gptResultContent.innerHTML = errorLink;
        }
    });
}

function hidePopup() {
    popup.style.display = 'none';
}

icon.addEventListener('click', showPopup);
document.addEventListener('click', (event) => {
    if (event.target !== icon) {
        // hidePopup();
    }
});

function handleMouseOut(event) {
    if (selectedText.length > 0 && !window.getSelection().containsNode(event.target, true)) {
        console.log('Selected text:', selectedText);
        document.removeEventListener('mouseout', handleMouseOut);
        selectedText = '';

    }
}

let selectedText = '';
document.addEventListener('mouseup', (event) => {
    const selection = window.getSelection();
    const currentSelection = window.getSelection().toString();
    if (currentSelection.length > 0 && currentSelection !== selectedText) {
        selectedText = currentSelection;

        // document.addEventListener('mouseout', handleMouseOut);
        const cursorPosition = {
            x: event.clientX,
            y: event.clientY
        };

        icon.style.left = `${cursorPosition.x + window.scrollX + 25}px`;
        icon.style.top = `${cursorPosition.y + window.scrollY}px`;
        icon.style.display = 'block';

        // const range = selection.getRangeAt(0);
        // const rect = range.getBoundingClientRect();
        // icon.style.left = `${rect.right + window.scrollX}px`;
        // icon.style.top = `${rect.top + window.scrollY}px`;
        // icon.style.display = 'block';
    } else {
        icon.style.display = 'none';
        // hidePopup();
    }
});