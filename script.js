const messageInput = document.querySelector(".input-bar input");
const sendButton = document.querySelector(".send-btn");
const messages = document.querySelector(".messages");
const newChatButton = document.querySelector(".new-chat-btn");
const chatHistory = document.querySelector(".chat-history ul");
const clearButton = document.querySelector(".clear-btn");

let isGenerating = false;
let chats = [];
let chat;


// ===============================
// MOCK AI RESPONSES
// ===============================

const mockResponses = [
    "Hello! How can I help you?",
    "That's a good question. Let me explain it.",
    "I can help you with HTML, CSS, JavaScript, and Django.",
    "This is a simulated AI response.",
    "Great! Let's solve this step by step."
];


// ===============================
// LOAD CHATS FROM LOCAL STORAGE
// ===============================

const savedChats = localStorage.getItem("chats");

if (savedChats) {
    chats = JSON.parse(savedChats);
}


// ===============================
// RESTORE ACTIVE CHAT
// ===============================

if (chats.length > 0) {

    const activeChatId = localStorage.getItem("activeChatId");

    if (activeChatId) {
        chat = chats.find(function (chatItem) {
            return chatItem.id === Number(activeChatId);
        });
    }

    if (!chat) {
        chat = chats[0];
    }

} else {

    chat = createNewChat();
}


// ===============================
// CREATE NEW CHAT OBJECT
// ===============================

function createNewChat() {

    return {
        id: Date.now(),
        title: "New Chat",
        timestamp: new Date().toISOString(),
        messages: []
    };
}


// ===============================
// RENDER CHAT HISTORY
// ===============================

function renderChatHistory() {

    chatHistory.innerHTML = "";

    chats.forEach(function (chatItem) {

        const listItem = document.createElement("li");

        listItem.textContent = chatItem.title;

        listItem.addEventListener("click", function () {

            if (isGenerating) {
                return;
            }

            chat = chatItem;

            localStorage.setItem(
                "activeChatId",
                chat.id
            );

            messages.innerHTML = "";

            renderMessages();
        });

        chatHistory.appendChild(listItem);
    });
}


// ===============================
// RENDER MESSAGES
// ===============================

function renderMessages() {

    messages.innerHTML = "";

    chat.messages.forEach(function (message) {

        const messageElement =
            document.createElement("div");

        messageElement.classList.add("message");

        if (message.role === "user") {

            messageElement.classList.add(
                "user-message"
            );

        } else {

            messageElement.classList.add(
                "ai-message"
            );
        }

        messageElement.textContent =
            message.content;

        messages.appendChild(messageElement);
    });

    messages.scrollTop = messages.scrollHeight;
}


// ===============================
// NEW CHAT
// ===============================

newChatButton.addEventListener(
    "click",
    function () {

        if (isGenerating) {
            return;
        }

        chat = createNewChat();

        localStorage.setItem(
            "activeChatId",
            chat.id
        );

        messages.innerHTML = "";
        messageInput.focus();
    }
);


// ===============================
// CLEAR CONVERSATIONS
// ===============================

clearButton.addEventListener(
    "click",
    function () {

        if (isGenerating) {
            return;
        }

        localStorage.removeItem("chats");
        localStorage.removeItem("activeChatId");

        chats = [];

        chat = createNewChat();

        messages.innerHTML = "";

        renderChatHistory();

        messageInput.focus();
    }
);


// ===============================
// SEND MESSAGE
// ===============================

sendButton.addEventListener(
    "click",
    function () {

        const userText = messageInput.value;

        // Prevent empty messages
        if (userText.trim() === "") {
            return;
        }

        // Prevent multiple AI generations
        if (isGenerating) {
            return;
        }

        // Save the chat that started this generation
        const currentChat = chat;

        isGenerating = true;

        sendButton.disabled = true;
        newChatButton.disabled = true;

        // Disable chat history switching
        chatHistory.style.pointerEvents = "none";

        // ===============================
        // SET CHAT TITLE
        // ===============================

        if (currentChat.messages.length === 0) {

            currentChat.title =
                userText.slice(0, 30);
        }


        // ===============================
        // SAVE USER MESSAGE
        // ===============================

        currentChat.messages.push({
            role: "user",
            content: userText
        });


        // Add chat to chats only
        // when first message is sent

        if (!chats.includes(currentChat)) {
            chats.push(currentChat);
        }


        localStorage.setItem(
            "chats",
            JSON.stringify(chats)
        );

        localStorage.setItem(
            "activeChatId",
            currentChat.id
        );


        // Update history
        renderChatHistory();


        // ===============================
        // DISPLAY USER MESSAGE
        // ===============================

        const userMessage =
            document.createElement("div");

        userMessage.classList.add(
            "message",
            "user-message"
        );

        userMessage.textContent = userText;

        messages.appendChild(userMessage);

        messages.scrollTop =
            messages.scrollHeight;


        // ===============================
        // TYPING INDICATOR
        // ===============================

        const typingMessage =
            document.createElement("div");

        typingMessage.classList.add(
            "message",
            "ai-message",
            "typing"
        );

        typingMessage.textContent = "...";

        messages.appendChild(typingMessage);

        messages.scrollTop =
            messages.scrollHeight;


        // ===============================
        // SIMULATE AI THINKING
        // ===============================

        setTimeout(function () {

            typingMessage.remove();


            const aiMessage =
                document.createElement("div");

            aiMessage.classList.add(
                "message",
                "ai-message"
            );


            const aiResponse =
                mockResponses[
                    Math.floor(
                        Math.random() *
                        mockResponses.length
                    )
                ];


            let index = 0;


            // Add AI message to DOM
            messages.appendChild(aiMessage);


            // ===============================
            // STREAM AI RESPONSE
            // ===============================

            const typingInterval =
                setInterval(function () {

                    aiMessage.textContent +=
                        aiResponse[index];

                    messages.scrollTop =
                        messages.scrollHeight;

                    index++;


                    // ===============================
                    // AI RESPONSE COMPLETE
                    // ===============================

                    if (
                        index ===
                        aiResponse.length
                    ) {

                        clearInterval(
                            typingInterval
                        );


                        // IMPORTANT:
                        // Save response to the
                        // original chat

                        currentChat.messages.push({
                            role: "ai",
                            content: aiResponse
                        });


                        localStorage.setItem(
                            "chats",
                            JSON.stringify(chats)
                        );


                        isGenerating = false;

                        sendButton.disabled =
                            false;

                        newChatButton.disabled =
                            false;

                        chatHistory.style.pointerEvents =
                            "auto";

                        messageInput.focus();
                    }

                }, 50);

        }, 1500);


        // Clear input
        messageInput.value = "";

        messageInput.focus();
    }
);


// ===============================
// ENTER KEY
// ===============================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendButton.click();
        }
    }
);


// ===============================
// INITIAL RENDER
// ===============================

renderMessages();
renderChatHistory();