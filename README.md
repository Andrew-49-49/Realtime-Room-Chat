# Realtime Room Chat

This is a modern, real-time chat web application built with Next.js, Socket.IO, and Tailwind CSS. It allows users to create and join chat rooms using unique codes.

## Features

- **Create Chat Rooms**: Generate a unique 6-character room code to share with others.
- **Join Chat Rooms**: Join an existing chat room with the room code and a unique nickname.
- **Real-Time Messaging**: Instantaneous message delivery within rooms.
- **User Presence**: See who's currently in the chat room.
- **Join/Leave Notifications**: Get notified when a user joins or leaves.
- **Responsive Design**: Clean and modern UI that works on desktop and mobile devices.

## Tech Stack

- **Frontend**: Next.js (React), Tailwind CSS, ShadCN UI, Lucide React Icons
- **Backend**: Node.js, Express
- **Real-Time Communication**: Socket.IO

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd realtime-room-chat
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start the Next.js application with the custom Express server for Socket.IO.

2.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

### Building for Production

To create a production build, run:
```bash
npm run build
```

And to start the production server:
```bash
npm run start
```

## How to Use the App

### Creating a Room

1.  Navigate to the home page.
2.  Select the "Create Room" tab.
3.  Enter a nickname you'd like to use in the chat.
4.  Click the "Create and Join Room" button.
5.  You will be redirected to the new chat room. The unique room code will be displayed at the top of the chat, which you can share with others.

### Joining a Room

1.  Navigate to the home page.
2.  Select the "Join Room" tab.
3.  Enter your desired nickname.
4.  Enter the 6-character room code provided by the room creator.
5.  Click the "Join Room" button.
6.  If the room code is valid and the nickname isn't already taken in that room, you will be taken to the chat. Otherwise, an error message will be displayed.

### In the Chat Room

- **Send Messages**: Type your message in the input box at the bottom and press Enter or click the send button.
- **View Users**: The list of users currently in the room is on the right-hand side (or in a collapsible drawer on mobile).
- **Leave Room**: Click the "Leave Room" button at the top to return to the home page. Others will be notified that you have left.
