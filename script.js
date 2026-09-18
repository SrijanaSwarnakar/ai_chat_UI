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
    async function () {

        const userText = messageInput.value.trim();

        // Prevent empty messages
        if (userText === "") {
            return;
        }

        // Prevent multiple requests
        if (isGenerating) {
            return;
        }

        // Save the chat that started this request
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


        // Save chats
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
        // SEND MESSAGE TO BACKEND
        // ===============================

        try {

            const response = await fetch(
                "http://localhost:3000/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: userText
                    })
                }
            );


            // Remove typing indicator
            typingMessage.remove();


            // Check HTTP response
            if (!response.ok) {

                throw new Error(
                    "Server returned " +
                    response.status
                );
            }


            const data = await response.json();


            // Check backend response
            if (!data.reply) {

                throw new Error(
                    "No reply received from Gemini"
                );
            }


            const aiResponse = data.reply;


            // ===============================
            // CREATE AI MESSAGE
            // ===============================

            const aiMessage =
                document.createElement("div");

            aiMessage.classList.add(
                "message",
                "ai-message"
            );

            messages.appendChild(aiMessage);


            // ===============================
            // STREAM AI RESPONSE
            // ===============================

            let index = 0;

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


                        // Save AI response
                        currentChat.messages.push({
                            role: "ai",
                            content: aiResponse
                        });


                        // Save updated chat
                        localStorage.setItem(
                            "chats",
                            JSON.stringify(chats)
                        );


                        // Unlock UI
                        isGenerating = false;

                        sendButton.disabled =
                            false;

                        newChatButton.disabled =
                            false;

                        chatHistory.style.pointerEvents =
                            "auto";

                        messageInput.focus();
                    }

                }, 20);


        } catch (error) {

            console.error(
                "Gemini Error:",
                error
            );


            // Remove typing indicator
            if (typingMessage) {
                typingMessage.remove();
            }


            // Display error
            const errorMessage =
                document.createElement("div");

            errorMessage.classList.add(
                "message",
                "ai-message"
            );

            errorMessage.textContent =
                "Sorry, I couldn't get a response from Gemini.";

            messages.appendChild(errorMessage);


            // Unlock UI
            isGenerating = false;

            sendButton.disabled =
                false;

            newChatButton.disabled =
                false;

            chatHistory.style.pointerEvents =
                "auto";

            messageInput.focus();
        }


        // Clear input
        messageInput.value = "";
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