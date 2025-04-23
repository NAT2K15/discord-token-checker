# Discord Bot Token Checker


A modern web application for validating Discord bot tokens and viewing detailed information about bots and their servers. Built with Node.js and modern web technologies.

![Discord Bot Token Checker](https://i.imgur.com/QAf7XRR.png)

## ✨ Features

### Bot Information
- Validate Discord bot tokens
- View detailed bot information:
  - Username and avatar
  - Creation date and age
  - Verification status
  - Total server count
  - Total member count
  - Application ID
  - Verification badges

### Server Information
- Comprehensive server list with:
  - Server name and icon
  - Member count
  - Server features
  - Server ID
- Server sorting options:
  - Sort by member count
  - Sort by server name
  - Sort by server ID

### Security
- Secure token handling
- No data storage - everything processed in memory
- Password-protected token input
- Token visibility toggle

### UI/UX
- Modern glass-morphism design
- Dark mode optimized
- Responsive layout
- Interactive hover effects
- Loading animations
- Error handling with visual feedback

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. Clone the repository
```bash
git clone https://github.com/nat2k15/discord-token-checker.git
cd discord-token-checker
```

2. Install dependencies
```bash
npm install
```

3. Start the server
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## 📝 Usage

1. Enter your Discord bot token in the input field
2. Click "Check Token" or press Enter
3. View the detailed information about your bot:
   - Basic bot information
   - Server list
   - Member statistics
4. Use the sorting options to organize the server list

## 🛠️ Built With

- **Frontend**:
  - HTML5
  - TailwindCSS
  - JavaScript (Vanilla)
  - Font Awesome Icons

- **Backend**:
  - Node.js
  - Express.js
  - Discord.js

## 🔒 Security Considerations

- The application does not store any tokens or data
- All processing is done in memory
- Tokens are only used to fetch information
- The application automatically clears the token input after checking
- Password field is used for token input to prevent accidental exposure

## ⚠️ Important Notes

- This tool is intended for legitimate bot developers to check their own tokens
- Do not use this tool to check tokens that don't belong to you
- The application requires an active internet connection
- Some features may require specific bot permissions

