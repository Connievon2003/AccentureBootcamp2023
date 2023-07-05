import { useState } from "react";
import "./App.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const API_KEY = "";

const systemMessageRecommendation = {
  role: "system",
  content:
    "You are a doctor. Recommend users what specific type of doctor they should see based on the symptoms they tell you. Keep your response relatively short. Please ask follow questions to properly diagnose the user's symtptoms. Also suggest if the user even needs to go to the doctor, if deemed necessary. ",
};

const systemMessageKeywords = {
  role: "system",
  content:
    "In 4 to 6 words, say what specific type of doctor, including general practitioner, the user should visit based on the symptoms they tell you. Please don't use any filler words. Don't recommend specialists if a general practioner is suffice to address the symptoms given",
};

function App() {
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm DoctorFinder! What symptoms are you showing?",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [medicalService, setMedicalService] = useState("")
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: "outgoing",
      sender: "user",
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Initial system message to determine ChatGPT functionality
    // How it responds, how it talks, etc.
    setIsTyping(true);
    await processMessageToChatGPT(newMessages);
  };

  async function processMessageToChatGPT(chatMessages) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message };
    });

    // Get the request body set up with the model we plan to use
    // and the messages which we formatted above. We add a system message in the front to'
    // determine how we want chatGPT to act.
    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessageRecommendation, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
          },
        ]);
        setIsTyping(false);
      });

    const apiRequestBodyKeywords = {
      model: "gpt-3.5-turbo",
      messages: [
        systemMessageKeywords, // The system message DEFINES the logic of our chatGPT
        ...apiMessages, // The messages from our chat with ChatGPT
      ],
    };

    console.log(systemMessageKeywords)

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBodyKeywords),
    })
      .then((data) => {
        return data.json();
      })
      .then((data) => {
        let parsedContent = data.choices[0].message.content.replace(/\s+/g, '+');
        setMedicalService(parsedContent)
        console.log(parsedContent);
      });
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "600px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? (
                  <TypingIndicator content="DoctorFinder is typing" />
                ) : null
              }
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />;
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />
          </ChatContainer>
        </MainContainer>
      </div>
      <iframe 
      src={`https://www.google.com/maps/embed/v1/search?key=&q=${medicalService}+in+melbourne`}
      width="600" 
      height="450" 
      allowFullScreen="" 
      loading="lazy" 
      referrerPolicy="no-referrer-when-downgrade">
      </iframe>
    </div>
  );
}

export default App;
