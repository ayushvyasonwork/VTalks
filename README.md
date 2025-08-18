
Project Type:
Real-time video conferencing application (SFU - Selective Forwarding Unit architecture)

Tech Stack:
JavaScript (ES Modules), Node.js, Express, Socket.IO, Mediasoup,HTML, CSS

Architecture:
Client-Server architecture with a Selective Forwarding Unit (SFU). The server (Node.js with Express) manages Mediasoup workers, routers, transports, producers, and consumers. Clients (browser-based) connect via Socket.IO to negotiate media streams and interact with the Mediasoup server.

Key Features:
1. Room Management: Create and join video conference rooms.
2. Media Streaming: Transmit and receive audio and video streams.
3. SFU Architecture: Efficiently forward media streams to participants in a room.
4. Socket.IO Integration: Real-time communication between clients and server.
5. Basic UI: Display local and remote video feeds.

Complexity Level:
Medium


Objective: Create a basic video conferencing application with room creation, joining, and peer-to-peer video streaming using Mediasoup and Socket.IO.

Implementation Steps:

1. Server-Side (Node.js with Express and Mediasoup):

   a. Setup:
      - Create a new Node.js project: `npm init -y`
      - Install dependencies: `npm install express socket.io mediasoup dotenv`
      - Create a `.env` file to store environment variables (e.g., PORT).

   b. Mediasoup Worker:
      - Implement the `createWorker` function to initialize a Mediasoup worker.
      - Handle worker `died` events for error handling.

   c. Router and Room Management:
      - Implement room creation logic. Use a simple object (`rooms`) to store room information (Router, peer IDs).
      - When a client joins, create a Mediasoup Router for the room if it doesn't exist.

   d. Transport Creation:
      - Implement functions to create Mediasoup Transports (WebRtcTransport) for each client.
      - Handle `dtlsParameters` negotiation between client and server.

   e. Producer and Consumer Logic:
      - Implement functions to create Mediasoup Producers when a client publishes media.
      - Implement functions to create Mediasoup Consumers for each client to receive media from other producers in the room.
      - Manage `producers`, `consumers`, and `transports` arrays to track active media connections.

   f. Socket.IO Integration:
      - Use Socket.IO to handle client connections, disconnections, and signaling.
      - Implement Socket.IO event handlers for:
         - `join-room`: Client joins a room.
         - `create-transport`: Client requests a transport to be created.
         - `connect-transport`: Client provides DTLS parameters to connect the transport.
         - `produce`: Client starts producing media.
         - `consume`: Client requests to consume media from another peer.

   g. Error Handling:
      - Implement basic error handling for Mediasoup operations.

   AI Coding Assistant Instructions:
      - "Create a Node.js server using Express and Socket.IO."
      - "Implement the `createWorker` function using the Mediasoup library."
      - "Implement Socket.IO event handlers for `join-room`, `create-transport`, `connect-transport`, `produce`, and `consume`."
      - "Use a simple object to store room information (Router, peer IDs)."
      - "Implement Mediasoup Transport, Producer, and Consumer creation logic."

2. Client-Side (HTML, JavaScript):

   a. HTML Structure:
      - Create a basic HTML page with:
         - A local video element (`<video id="localVideo">`).
         - A remote video container (`<div id="videoContainer">`).

   b. JavaScript Logic:
      - Use `mediasoup-client` library to interact with the Mediasoup server.
      - Implement functions for:
         - Connecting to the Socket.IO server.
         - Joining a room (sending `join-room` event).
         - Creating a Mediasoup device.
         - Creating Transports (sending `create-transport` event).
         - Connecting Transports (sending `connect-transport` event).
         - Producing media (using `getUserMedia` and creating a Producer).
         - Consuming media (creating Consumers and displaying remote video streams).

   c. Media Handling:
      - Use `getUserMedia` to capture audio and video from the user's webcam and microphone.
      - Attach local media stream to the local video element.
      - Dynamically create remote video elements and attach remote media streams to them.

   AI Coding Assistant Instructions:
      - "Create an HTML page with a local video element and a remote video container."
      - "Use the `mediasoup-client` library to connect to the Socket.IO server."
      - "Implement functions for joining a room, creating a Mediasoup device, and creating Transports."
      - "Implement functions for producing and consuming media streams."
      - "Use `getUserMedia` to capture local media and attach it to the local video element."
      - "Dynamically create remote video elements and attach remote media streams to them."

3. Testing:

   a. Run the Node.js server.
   b. Open the HTML page in multiple browser windows or tabs.
   c. Join the same room in each window/tab.
   d. Verify that video streams are correctly transmitted and received between peers.

4. Simplifications:

   a. No authentication or user management.
   b. No advanced features like screen sharing, chat, or recording.
   c. Minimal UI.
   d. Single Mediasoup worker.

5. Deployment:

   a. Deploy the Node.js server to a cloud platform (e.g., Heroku, AWS).
   b. Host the HTML/JavaScript files on a static file server (e.g., Netlify, Vercel).
