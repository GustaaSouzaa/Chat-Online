document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let currentUser = '';
    let mediaRecorder;
    let audioChunks = [];
    let typingTimer;
    const TYPING_TIMER_LENGTH = 1500;

    const loginPage = document.getElementById('login-page');
    const chatPage = document.getElementById('chat-page');
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username-input');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const profilePicContainer = document.querySelector('.profile-pic-container');
    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePicPreview = document.getElementById('profile-pic-preview');
    const attachButton = document.getElementById('attach-button');
    const attachmentMenu = document.getElementById('attachment-menu');
    const attachImageBtn = document.getElementById('attach-image-btn');
    const imageFileInput = document.getElementById('image-file-input');
    const attachAudioBtn = document.getElementById('attach-audio-btn');
    const audioFileInput = document.getElementById('audio-file-input');
    const recordAudioBtn = document.getElementById('record-audio-btn');
    const typingIndicator = document.getElementById('typing-indicator');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        let theme = 'light';
        if (document.body.classList.contains('dark-theme')) {
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    });
    
    attachButton.addEventListener('click', (event) => {
        event.stopPropagation();
        attachmentMenu.classList.toggle('visible');
    });
    window.addEventListener('click', () => {
        if (attachmentMenu.classList.contains('visible')) {
            attachmentMenu.classList.remove('visible');
        }
    });
    attachmentMenu.addEventListener('click', (event) => {
        event.stopPropagation();
    });
    attachImageBtn.addEventListener('click', () => {
        imageFileInput.click();
        attachmentMenu.classList.remove('visible');
    });
    imageFileInput.addEventListener('change', () => {
        const file = imageFileInput.files[0];
        if (file) {
            socket.emit('new_attachment', { file_data: file, file_name: file.name, file_type: 'image' });
        }
        imageFileInput.value = '';
    });
    attachAudioBtn.addEventListener('click', () => {
        audioFileInput.click();
        attachmentMenu.classList.remove('visible');
    });
    audioFileInput.addEventListener('change', () => {
        const file = audioFileInput.files[0];
        if (file) {
            socket.emit('new_attachment', { file_data: file, file_name: file.name, file_type: 'audio' });
        }
        audioFileInput.value = '';
    });
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            recordAudioBtn.style.backgroundColor = '#dc3545';
            mediaRecorder.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });
            mediaRecorder.addEventListener("stop", () => {
                if (audioChunks.length === 0) return;
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                socket.emit('new_attachment', {
                    file_data: audioBlob,
                    file_name: `gravacao-${Date.now()}.webm`,
                    file_type: 'audio'
                });
                stream.getTracks().forEach(track => track.stop());
            });
            mediaRecorder.start();
        } catch (err) {
            console.error("Erro ao aceder ao microfone:", err);
            alert("Não foi possível aceder ao microfone. Verifique as permissões do navegador.");
        }
    };
    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            recordAudioBtn.style.backgroundColor = '#495057';
        }
    };
    recordAudioBtn.addEventListener('mousedown', startRecording);
    recordAudioBtn.addEventListener('mouseup', stopRecording);
    recordAudioBtn.addEventListener('touchstart', startRecording);
    recordAudioBtn.addEventListener('touchend', stopRecording);
    loginButton.addEventListener('click', () => {
        const username = usernameInput.value;
        const profilePicFile = profilePicInput.files[0];
        if (username.trim() !== '') {
            socket.emit('user_join', { 
                username: username,
                image_data: profilePicFile,
                image_name: profilePicFile ? profilePicFile.name : null
            });
            profilePicInput.value = '';
        } else {
            alert('Por favor, digite um nome para entrar no chat.');
        }
    });
    socket.on('username_taken_error', (data) => {
        alert(data.message);
    });
    socket.on('user_joined_notification', (data) => {
        if (data.msg.startsWith(usernameInput.value)) {
            currentUser = usernameInput.value;
            loginPage.style.display = 'none';
            chatPage.style.display = 'flex';
        }
        appendMessage({ msg: data.msg });
    });
    socket.on('user_left_notification', (data) => {
        appendMessage({ msg: data.msg });
    });
    socket.on('chat_message_update', (data) => {
        appendMessage(data);
    });
    messageInput.addEventListener('keyup', () => {
        clearTimeout(typingTimer);
        socket.emit('start_typing');
        typingTimer = setTimeout(() => {
            socket.emit('stop_typing');
        }, TYPING_TIMER_LENGTH);
    });
    messageInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            clearTimeout(typingTimer);
            socket.emit('stop_typing');
            sendMessage();
        }
    });
    function sendMessage() {
        const messageText = messageInput.value;
        if (messageText.trim() !== '') {
            socket.emit('new_message', { msg: messageText });
            messageInput.value = '';
        }
    }
    sendButton.addEventListener('click', sendMessage);
    profilePicContainer.addEventListener('click', () => {
        profilePicInput.click();
    });
    profilePicInput.addEventListener('change', () => {
        const file = profilePicInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    function appendMessage(data) {
        let type, sender, msg, pfp_url, image_url, audio_url;
        if (data.msg) {
            type = data.username ? (data.username === currentUser ? 'my-message' : 'other-message') : 'chat-notification';
            sender = data.username;
            msg = data.msg;
            pfp_url = data.pfp;
        } else if (data.image_url) {
            type = data.username === currentUser ? 'my-message' : 'other-message';
            sender = data.username;
            pfp_url = data.pfp;
            image_url = data.image_url;
        } else if (data.audio_url) {
            type = data.username === currentUser ? 'my-message' : 'other-message';
            sender = data.username;
            pfp_url = data.pfp;
            audio_url = data.audio_url;
        } else {
            return;
        }
        const messageWrapper = document.createElement('div');
        if(type === 'chat-notification'){
             messageWrapper.classList.add(type);
             messageWrapper.textContent = msg;
        } else {
            messageWrapper.classList.add('message-wrapper', type);
        }
        if (type === 'my-message' || type === 'other-message') {
            const pfpElement = document.createElement('img');
            pfpElement.src = pfp_url;
            pfpElement.classList.add('message-pfp');
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            const senderElement = document.createElement('div');
            senderElement.classList.add('message-sender');
            senderElement.textContent = sender;
            const contentElement = document.createElement('div');
            contentElement.classList.add('message-content');
            if (msg) {
                contentElement.textContent = msg;
            } else if (image_url) {
                const imageElement = document.createElement('img');
                imageElement.src = image_url;
                contentElement.appendChild(imageElement);
                contentElement.style.padding = '5px';
            } else if (audio_url) {
                const audioElement = document.createElement('audio');
                audioElement.src = audio_url;
                audioElement.controls = true;
                contentElement.appendChild(audioElement);
            }
            messageElement.appendChild(senderElement);
            messageElement.appendChild(contentElement);
            if (type === 'my-message') {
                messageWrapper.appendChild(messageElement);
                messageWrapper.appendChild(pfpElement);
            } else {
                messageWrapper.appendChild(pfpElement);
                messageWrapper.appendChild(messageElement);
            }
        }
        chatMessages.appendChild(messageWrapper);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});