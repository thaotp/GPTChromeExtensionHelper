
let sessionToken = "";
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.payload) {
        console.log('Message received:', request.payload);
        handleBrowserAction(request.payload).then((data) => {
            if (data !== 'false') {
                sendResponse({ data: parseGPTResponse(data) });
            } else {
                sendResponse({ error: 'true' });
            }

        });
        // Cuộc sống an lành↵↵Dịch ra tiếng nhật
        return true;
    }
});
// Retrieve saved text from storage
chrome.storage.sync.get("authenticationContentGPT", function (result) {
    sessionToken = result.authenticationContentGPT
});

function getCookies(domain, callback) {
    chrome.cookies.getAll({ url: domain }, function (cookie) {
        if (callback) {
            callback(cookie);
        }
    });
}

function handleBrowserAction(message) {
    return new Promise((resolve) => {
        chrome.storage.sync.get("authenticationContentGPT", function (result) {
            const sessionToken = result.authenticationContentGPT;
            getCookies("https://chat.openai.com/", function (cookies) {
                let cookieString = "";
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i];
                    if (cookie.name === "authorization") {
                        // sessionToken = cookie.value;
                    } else {
                        cookieString += `${cookie.name}=${cookie.value}; `;
                    }
                }
                resolve(execRequest(sessionToken, cookieString, message));
            });
        });
    });
}

function parseGPTResponse(formattedString) {
    console.log(formattedString)
    try {
        const dataChunks = formattedString.split("data:");
        const responseObjectText = dataChunks[dataChunks.length - 2].trim();
        const responseObject = JSON.parse(responseObjectText);
        return responseObject.message.content.parts[0];
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return 'error-d2160fb73c5b';
    }

}

function execRequest(sessionToken, cookieString, message) {
    return fetch('https://chat.openai.com/backend-api/conversation', {
        method: 'POST',
        headers: {
            'authority': 'chat.openai.com',
            'accept': 'text/event-stream',
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'authorization': `${sessionToken}`,
            'content-type': 'application/json',
            'cookie': `'${cookieString}'`,
            'origin': 'https://chat.openai.com',
            'referer': 'https://chat.openai.com/c/c36b4cf9-7c46-4146-8950-d2160fb73c5b',
            'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({
            'action': 'next',
            'messages': [{
                'id': generateUUID(),
                'author': { 'role': 'user' },
                'content': {
                    'content_type': 'text',
                    'parts': [`${message}`]
                }
            }],
            'conversation_id': 'c36b4cf9-7c46-4146-8950-d2160fb73c5b',
            'parent_message_id': 'd8c2904a-2c5b-4956-b295-f1567bcdf31e',
            'model': 'text-davinci-002-render-sha',
            'timezone_offset_min': -540,
            'variant_purpose': 'none'
        })
    })
        .then(response => response.text())
        .then((data) => {
            return data;
        })
        .catch(error => {
            console.error(error)
            return 'false';
        });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// chrome.action.onClicked.addListener(handleBrowserAction);