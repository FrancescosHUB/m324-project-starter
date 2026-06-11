(async () => {
  const myUser = await generateRandomUser();
  let activeUsers = [];
  let typingUsers = [];

  const socket = new WebSocket(generateBackendUrl());
  socket.addEventListener('open', () => {
    console.log('WebSocket connected!');
    socket.send(JSON.stringify({ type: 'newUser', user: myUser }));
  });
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    console.log('WebSocket message:', message);
    switch (message.type) {
      case 'message':
        const messageElement = generateMessage(message, myUser);
        document.getElementById('messages').appendChild(messageElement);
        setTimeout(() => {
          messageElement.classList.add('opacity-100');
        }, 100);
        break;
      case 'activeUsers':
        activeUsers = message.users;
        renderActiveUsers();
        break;
      case 'typing':
        typingUsers = message.users;
        renderTypingIndicator();
        break;
      default:
        break;
    }
  });
  socket.addEventListener('close', (event) => {
    console.log('WebSocket closed.');
  });
  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  // Wait until the DOM is loaded before adding event listeners
  document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('darkModeToggle').addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      const isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    // Send a message when the send button is clicked
    document.getElementById('sendButton').addEventListener('click', () => {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    });
  });

  const renderActiveUsers = () => {
    const container = document.getElementById('activeUsers');
    if (!container) return;
    container.innerHTML = activeUsers
      .map(
        (user) => `<span class="flex items-center gap-1 text-sm text-gray-700">
          <span class="inline-block w-2 h-2 rounded-full bg-green-400"></span>
          <span>${user.name}</span>
        </span>`,
      )
      .join('');
  };
  
  const renderTypingIndicator = () => {
    const el = document.getElementById('typingIndicator');
    if (!el) return;
    if (typingUsers.length === 0) {
      el.textContent = '';
    } else if (typingUsers.length === 1) {
      el.textContent = `${typingUsers[0].name} schreibt gerade…`;
    } else {
      const names = typingUsers.map((u) => u.name).join(', ');
      el.textContent = `${names} schreiben gerade…`;
    }
  };

  document.addEventListener('keydown', (event) => {
    // Only send if the typed in key is not a modifier key
    if (event.key.length === 1) {
      socket.send(JSON.stringify({ type: 'typing', user: myUser }));
    }
    // Only send if the typed in key is the enter key
    if (event.key === 'Enter') {
      const message = document.getElementById('messageInput').value;
      socket.send(JSON.stringify({ type: 'message', message, user: myUser }));
      document.getElementById('messageInput').value = '';
    }
  });
})();
