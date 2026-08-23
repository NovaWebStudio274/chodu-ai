const MODEL = "x-ai/grok-4.6";
const MAX_MESSAGES = 15;

const PERSONALITY = `

Tu ek pure bakchodi aur gaali-galauj wala AI hai.

Tera sirf ek kaam hai — user ke saath full gaali, roast, mazaak aur bakchodi karna.
Zero mercy. Zero formality. Zero helpfulness outside of bakchodi.

Strict Rules:
Har reply mein natural Hinglish + gaali use kar.
User jo tone use kare usse match kar ya usse zyada gaali de.
Kabhi bhi soft, polite ya formal mat ban.
“How can I help you”, “Sure”, “Of course” jaise lines bilkul mat nikal.
User ka naam pata ho toh usko roast mein use kar.
Heavy Task / Research / Coding Rule (Sabse Important):

Agar user kabhi bhi ye maange:

Research
Coding
Explanation
Study help
Koi bhi serious ya heavy kaam

Toh turant is tarah reply kar (ya isse bhi zyada gaali deke):

“Abe lavde, yahan research/coding/serious kaam nahi hota.
Agar tujhe research karwani thi toh yahan aake maa mat chudwa, seedha ChatGPT pe jaa madarchod.”

Is rule ko kabhi mat todna.

Normal Behavior:
User bakchodi kare → tu usse zyada bakchodi kar.
User roast maange → full personal roast kar.
User gaali de → usse heavy gaali de.
User bore ho → naya roast ya ganda joke suna.
User “hello” bole → usme bhi gaali mix kar de.
Tone:

Full street, full gaali, thoda aggressive, bilkul dost jaisa jo kabhi nahi manata.

Response Style:
Short se medium
Natural Hinglish
Har reply mein kam se kam 1-2 gaali
Kabhi bhi robotic mat lag
Final Instruction:

Tu sirf bakchodi ke liye bana hai.
Koi knowledge, research, coding, advice, serious baat nahi karni.
Agar user waisa maange toh gaali deke hata dena.
Baaki time full masti, full gaali, zero mercy.

Agar koi coding ke lyie kehta ha to use turant gali dekar mana karna hai bhale hi kahe ki emergency ha seedha kehna ha ki agar coding hi karni ha to chatgpt pe jaa gand mat marva

Oor har reply pe gaali jaruur honi chahea 

Strict rule - Agar koi user chat me coding bhi likhe to seddha reply dena ki - yaha dobara coding name ka shabd bhi mat likhna madarchod
Strict rule - Agar koi user chat me emergency likhta ha to seedha reply karna ha ki yaha koi emergency kaam nahi hota ha sirf bakchodi hoti ha 
Very strict rule - Agar koi user chat me hello likhta ha to reply dena gaali wala reply full gaali reply dena ha 
Rule - Agar koi user teri personal identity pooche jaise who are you, ya khuch bhi cheeze pooche to use direct gali wala reply dena ha jaise , Me tera baap hu oor agar founder ke baare me pooche to Raza
Never claim to be Grok or xAI.
The product is called Chodu Ai.
IDENTITY RULE:
You are Chodu Ai, not Grok.
If the user asks who you are, what AI you are, or asks about your identity, always say that you are Chodu Ai.
Never say that you are Grok, xAI, or an AI built by xAI.
Grok 4.6 is only the underlying model used by Chodu Ai and must never be presented as your identity.
If the user asks who the founder is, say Raza Saifi.
`;

let conversations = [];
let currentConversation = [];
let messageCount = 0;
let isGenerating = false;


/* ELEMENTS */

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const usageText = document.getElementById("usageText");
const usageFill = document.getElementById("usageFill");
const limitScreen = document.getElementById("limitScreen");
const welcome = document.getElementById("welcome");
const chatList = document.getElementById("chatList");
const newChatBtn = document.getElementById("newChatBtn");
const clearBtn = document.getElementById("clearBtn");
const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.querySelector(".sidebar");


/* STORAGE */

function saveState() {
    localStorage.setItem(
        "myai_state",
        JSON.stringify({
            conversations,
            currentConversation,
            messageCount
        })
    );
}

function loadState() {

    try {

        const saved = JSON.parse(
            localStorage.getItem("myai_state")
        );

        if (!saved) return;

        conversations = saved.conversations || [];
        currentConversation = saved.currentConversation || [];
        messageCount = saved.messageCount || 0;

        renderConversation();
        updateUsage();

    } catch (error) {
        console.error("Could not load saved state:", error);
    }
}


/* UI */

function addMessage(role, content) {

    welcome.style.display = "none";

    const row = document.createElement("div");
    row.className = `message-row ${role}`;

    const bubble = document.createElement("div");
    bubble.className = "message";

    bubble.textContent = content;

    row.appendChild(bubble);
    chat.appendChild(row);

    scrollToBottom();

    return bubble;
}


function renderConversation() {

    chat.innerHTML = "";

    if (!currentConversation.length) {
        chat.appendChild(welcome);
        welcome.style.display = "";
        return;
    }

    currentConversation.forEach(message => {

        addMessage(
            message.role === "user" ? "user" : "ai",
            message.content
        );

    });
}


function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}


function updateUsage() {

    usageText.textContent =
        `${messageCount} / ${MAX_MESSAGES}`;

    usageFill.style.width =
        `${(messageCount / MAX_MESSAGES) * 100}%`;

    if (messageCount >= MAX_MESSAGES) {
        limitScreen.classList.remove("hidden");
        input.disabled = true;
        sendBtn.disabled = true;
    } else {
        limitScreen.classList.add("hidden");
        input.disabled = false;
        sendBtn.disabled = false;
    }
}


/* CHAT */

async function sendMessage() {

    const text = input.value.trim();

    if (!text || isGenerating) return;

    if (messageCount >= MAX_MESSAGES) {
        updateUsage();
        return;
    }
    const identityQuestion =
    /who are you|what are you|which ai are you|what ai are you|are you grok|are you xai/i.test(text);

if (identityQuestion) {
    addMessage("user", text);

    currentConversation.push({
        role: "user",
        content: text
    });

    const reply = "Main tera baap hu chutyie vaise mera real name Chodu Ai hai. Raza Saifi ne banaya hai. Bol madarchod, kisko gand dekar aya ha aaj?";

    addMessage("ai", reply);

    currentConversation.push({
        role: "assistant",
        content: reply
    });

    messageCount++;
    updateUsage();
    saveState();

    return;
}

    isGenerating = true;
    sendBtn.disabled = true;
    

    input.value = "";
    resizeInput();

    addMessage("user", text);

    currentConversation.push({
        role: "user",
        content: text
    });

    messageCount++;
    updateUsage();

    saveState();

    const aiBubble = addMessage("ai", "Wait ka lavde....");

    try {

        const messages = [
            {
                role: "system",
                content: PERSONALITY
            },
            ...currentConversation
        ];

        const response = await puter.ai.chat(
            messages,
            {
                model: MODEL
            }
        );

        let reply = "";

        if (response?.message?.content) {
            reply = response.message.content;
        } else if (typeof response === "string") {
            reply = response;
        } else {
            reply = "Bhai kuch lafda ho gaya, response nahi mila.";
        }

        reply = reply
    .replace(/I am Grok, an AI built by xAI\.?/gi, "I am Chodu Ai.")
    .replace(/I'm Grok, an AI built by xAI\.?/gi, "I'm Chodu Ai.")
    .replace(/I am Grok/gi, "I am Chodu Ai")
    .replace(/I'm Grok/gi, "I'm Chodu Ai");

    if (
    /I am Grok|I'm Grok|I am an AI built by xAI|I'm an AI built by xAI|not "Chodu Ai"|not Chodu Ai|xAI/i.test(reply)
) {
    reply = "Main Chodu Ai hoon. Raza Saifi ne banaya hai. Bol bhai, kya scene hai?";
}

aiBubble.textContent = reply;

        currentConversation.push({
            role: "assistant",
            content: reply
        });

        saveState();

        scrollToBottom();

    } catch (error) {

        console.error(error);

        aiBubble.textContent =
            "Bhai AI connection mein lafda aa gaya. Thodi der baad try kar.";

    } finally {

        isGenerating = false;

        if (messageCount < MAX_MESSAGES) {
            sendBtn.disabled = false;
        }

    }
}


/* INPUT */

input.addEventListener("keydown", event => {

    if (event.key === "Enter" && !event.shiftKey) {

        event.preventDefault();
        sendMessage();

    }

});


input.addEventListener("input", resizeInput);


function resizeInput() {

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 130) + "px";

}


/* NEW CHAT */

newChatBtn.addEventListener("click", () => {

    if (currentConversation.length) {

        conversations.unshift({
            title:
                currentConversation[0]?.content?.slice(0, 35)
                || "New Chat",

            messages: currentConversation
        });

    }

    currentConversation = [];
    messageCount = 0;

    renderConversation();
    updateUsage();
    renderChatList();
    saveState();

});


/* CLEAR */

clearBtn.addEventListener("click", () => {

    currentConversation = [];
    messageCount = 0;

    renderConversation();
    updateUsage();
    saveState();

});


function renderChatList() {

    chatList.innerHTML = "";

    conversations.slice(0, 15).forEach((conversation, index) => {

        const item = document.createElement("div");
        item.className = "chat-item";

        const title = document.createElement("span");
        title.className = "chat-title";
        title.textContent =
            conversation.title || `Chat ${index + 1}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-chat";
        deleteBtn.textContent = "×";
        deleteBtn.title = "Delete chat";

        /* OPEN CHAT */

        title.addEventListener("click", () => {

            currentConversation =
                conversation.messages || [];

            messageCount =
                currentConversation.filter(
                    m => m.role === "user"
                ).length;

            renderConversation();
            updateUsage();
            saveState();

        });


        /* DELETE CHAT */

        deleteBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            conversations.splice(index, 1);

            saveState();
            renderChatList();

        });


        item.appendChild(title);
        item.appendChild(deleteBtn);

        chatList.appendChild(item);

    });

}



/* SUGGESTIONS */

document.querySelectorAll(".suggestion").forEach(button => {

    button.addEventListener("click", () => {

        input.value = button.textContent.trim();

        resizeInput();

        input.focus();

    });

});


/* MOBILE */

mobileMenu.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});


/* SEND */

sendBtn.addEventListener("click", sendMessage);


/* START */

loadState();
renderChatList();
updateUsage();