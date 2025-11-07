# VTalks - Real-Time Video Conferencing App

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A real-time video conferencing application built with Node.js, Socket.IO, and the powerful Mediasoup SFU (Selective Forwarding Unit) for efficient media stream handling.

### [🎬 Watch the Demo Video](https://drive.google.com/file/d/14T71YRvoSrbwhy68DV3ZDBonUfIb5q9f/view?usp=drive_link)

---

## 📖 Table of Contents

-   [About The Project](#about-the-project)
-   [Key Features](#-key-features)
-   [Architecture](#-architecture)
-   [Tech Stack](#-tech-stack)
-   [Getting Started](#-getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [Usage](#-usage)
-   [Contributing](#-contributing)
-   [License](#-license)

## About The Project

VTalks is a WebRTC video conferencing application that demonstrates the power of a Selective Forwarding Unit (SFU) architecture. Unlike peer-to-peer (mesh) architectures that can be resource-intensive, the SFU model allows for scalable and efficient group video calls by having each participant send their media stream to a central server, which then forwards it to the other participants. This project uses **Mediasoup** as the SFU for robust, low-latency media routing.

## ✨ Key Features

-   **Room Management**: Dynamically create and join video conference rooms.
-   **High-Quality Media Streaming**: Transmit and receive multiple audio and video streams simultaneously.
-   **SFU Architecture**: Efficiently forwards media streams to all participants in a room, saving client-side bandwidth.
-   **Real-time Signaling**: Uses Socket.IO for fast and reliable communication between clients and the server.
-   **Simple UI**: A clean interface to display local and remote video feeds.

## 🏗️ Architecture

The application uses a client-server model. The **Node.js server** acts as the signaling layer and manages the **Mediasoup SFU**.

1.  **Signaling**: Clients connect to the server via **Socket.IO** to handle events like joining rooms, negotiating media capabilities, and managing streams.
2.  **Media Routing**: The server creates Mediasoup **Workers**, **Routers**, and **Transports**.
3.  **Client Connection**: Each client establishes a transport connection to the server's router.
4.  **Streaming**:
    -   A client sending media creates a **Producer** on the server.
    -   The server then creates a **Consumer** for all other clients in the room, allowing them to receive the media stream.

This SFU approach minimizes the upload bandwidth required by each client, as they only need to send their stream once to the server.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express
-   **Real-time Communication**: Socket.IO
-   **WebRTC/SFU**: Mediasoup
-   **Frontend**: NextJS
-   **Client-side Mediasoup Library**: `mediasoup-client`

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (v16 or later)
-   npm (Node Package Manager)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/ayushvyasonwork/VTalks.git](https://github.com/ayushvyasonwork/VTalks.git)
    cd project
    ```

2.  **Install Server Dependencies:**
    ```sh
    # Navigate to the server directory if you have one, otherwise run in root
    npm install express socket.io mediasoup dotenv
    ```

3.  **Setup Client Libraries:**
    The client-side uses `mediasoup-client`. Ensure you have it included in your HTML, typically via a CDN or by bundling it.
    ```html
    <script src="/path/to/mediasoup-client.min.js"></script>
    ```

4.  **Configure Environment Variables:**
    Create a `.env` file in the root of the server directory and add the following variables:
    ```
    PORT=3000
    ```

## 🏃 Usage

1.  **Start the server:**
    ```sh
    node server.js
    ```
    Your server should now be running on `http://localhost:3000`.

2.  **Launch the client:**
    Open the `index.html` file in your browser. You can open it in multiple tabs or windows to simulate multiple users.

3.  **Join a room:**
    Enter a room name and join. Verify that video streams are correctly transmitted and received between all peers.

## 🤝 Contributing

Contributions are welcome! If you have suggestions to improve the project, please feel free to fork the repository and create a pull request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
