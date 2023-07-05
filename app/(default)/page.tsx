"use client";

import { useRef, useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from "@chatscope/chat-ui-kit-react";
import "./styles.css";

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

export default function Home() {
  const chatBotRef = useRef<null | HTMLDivElement>(null);
  const mapsRef = useRef<null | HTMLDivElement>(null);
  const [messages, setMessages] = useState<any>([
    {
      message: "Hello, I'm EZhealth! What symptoms are you showing?",
      sentTime: "just now",
      sender: "ChatGPT",
    },
  ]);
  const [medicalService, setMedicalService] = useState<any>("");
  const [isTyping, setIsTyping] = useState<any>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSend = async (message: any) => {
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

  async function processMessageToChatGPT(chatMessages: any) {
    // messages is an array of messages
    // Format messages for chatGPT API
    // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
    // So we need to reformat

    let apiMessages = chatMessages.map((messageObject: any) => {
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
        let parsedContent = data.choices[0].message.content.replace(
          /\s+/g,
          "+"
        );
        setMedicalService(parsedContent);
        setSearched(true);
        console.log(parsedContent);
      });
  }

  const goToChatBot = () => {
    chatBotRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const goToMaps = () => {
    mapsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <>
        <section className="homePage">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
            {/* Hero content */}
            <div className="relative pt-32 pb-10 md:pt-40 md:pb-16">
              {/* Section header */}
              <div className="max-w-3xl mx-auto text-center pb-12 md:pb-16">
                <h1 className="h1 mb-4" data-aos="fade-up">
                  EZhealth
                </h1>
                <p
                  className="text-xl text-gray-400 mb-8"
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  Medical guidance at your fingertips.. or whatever
                </p>
                <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center">
                  <div data-aos="fade-up" data-aos-delay="400">
                    <button
                      className="btn text-white bg-purple-600 hover:bg-purple-700 w-full mb-4 sm:w-auto sm:mb-0"
                      onClick={goToChatBot}
                    >
                      Seek Medical Guidance
                    </button>
                  </div>
                  <div data-aos="fade-up" data-aos-delay="600">
                    <button
                      className="btn text-white bg-gray-700 hover:bg-gray-800 w-full sm:w-auto sm:ml-4"
                      onClick={goToMaps}
                    >
                      Find a Health Professional
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div className="chatbot" ref={chatBotRef}>
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator content="EZhealth is typing" />
                  ) : null
                }
              >
                {messages.map((message: any, i: any) => {
                  return <Message key={i} model={message} />;
                })}
              </MessageList>
              <MessageInput
                placeholder="Type message here"
                onSend={handleSend}
              />
            </ChatContainer>
          </MainContainer>
        </div>
        {searched && <h1 style={{textAlign: "center"}}>Consult the map below to see what health services are appropriate for you</h1>}
        <div ref={mapsRef} className="map">
          <iframe
            src={`https://www.google.com/maps/embed/v1/search?key=&q=${medicalService}+in+melbourne`}
            width="600"
            height="450"
            allowFullScreen={true}
            style={{ margin: "auto" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </>
    </>
  );
}