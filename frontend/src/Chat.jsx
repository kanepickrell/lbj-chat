import React, { useState } from 'react';
import './style.css';

function Chat() {
    const [messages, setMessages] = useState([]);
    const [userInput, setUserInput] = useState('');

    const sendMessage = async () => {
        if (userInput.trim() === '') return;

        const newMessage = `You: ${userInput}`;
        setMessages([...messages, newMessage]);

        // Clear input
        setUserInput('');

        // Trigger the background fade animation
        const chatContainer = document.getElementById('chat-container');
        chatContainer.classList.remove('fade-effect'); // Reset animation
        void chatContainer.offsetWidth; // Trigger reflow to restart animation
        chatContainer.classList.add('fade-effect');

        // Auto-scroll to the bottom of the chat box
        autoScroll();

        // Send the request to the backend
        try {
            const response = await fetch('http://127.0.0.1:8000/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userInput,
                    model_name: 'gpt2-base',
                    max_length: 150
                })
            });

            if (response.ok) {
                const data = await response.json();
                typeWriterEffect(`President Johnson: ${data.response}`);
            } else {
                setMessages([...messages, 'Error: Unable to get a response from the backend.']);
            }
        } catch (error) {
            setMessages([...messages, 'Error: Unable to get a response from the backend.']);
        }
    };

    const typeWriterEffect = (text) => {
        const chatBox = document.getElementById('chat-box');
        
        // Add a blank line or a space before the response
        const blankLine = document.createElement('div');
        blankLine.innerHTML = '<br>'; // This creates a blank line
        chatBox.appendChild(blankLine);

        const responseDiv = document.createElement('div');
        chatBox.appendChild(responseDiv);

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                responseDiv.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 25); // Adjust the delay for typing speed
                chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll as text is added
            } else {
                // Add another blank line after the response message if needed
                const blankLineAfter = document.createElement('div');
                blankLineAfter.innerHTML = '<br>';
                chatBox.appendChild(blankLineAfter);

                autoScroll();
            }
        }
        typeWriter();
    };

    const autoScroll = () => {
        const chatBox = document.getElementById('chat-box');
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    return (
        <div>
            <header>
                <h1 className="metrophobic-regular" style={{ paddingLeft: '20px', fontWeight: 'bolder' }}>LBJ Chat</h1>
                <div id="model-dropdown"></div>
            </header>
            <main id="chat-container" className="metrophobic-regular">
                <div id="chat-box" className="metrophobic-regular">
                    {messages.map((msg, index) => (
                        <div key={index}>{msg}</div>
                    ))}
                </div>
                <input
                    type="text"
                    id="user-input"
                    placeholder="Ask President Johnson..."
                    autoComplete="off"
                    className="metrophobic-regular"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') sendMessage();
                    }}
                />
                <button
                    id="send-btn"
                    className="metrophobic-regular"
                    onClick={sendMessage}
                >
                    Chat
                </button>
            </main>
            {/* <img src={`${process.env.PUBLIC_URL}/lbj.png`} alt="Lyndon B. Johnson" /> */}
        </div>
    );
}

export default Chat;
