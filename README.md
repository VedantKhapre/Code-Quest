# Code Quest

Code Quest is an interactive platform for solving coding challenges with an integrated AI assistant. This project combines a powerful code editor, problem-solving interface, and markdown editor in one seamless application.

![Code Quest](https://0x0.st/8py_.png)

## Features

- **Interactive Code Editor**: Write and run C++ and Java code directly in the browser
- **Programming Challenges**: Collection of algorithmic problems with difficulty ratings
- **AI-powered Assistant**: Get help with your code using the built-in Mistral AI chat interface
- **Progress Tracking**: Save your solved problems and track your progress
- **Markdown Editor**: Create and export documentation with a built-in markdown editor
- **User Authentication**: Secure login/signup system to save your progress

## Technologies Used

- **Frontend**: Astro, React, Bootstrap
- **Code Editor**: Monaco Editor (VS Code's editor)
- **AI Integration**: Mistral AI API
- **Backend**: Express.js for code execution
- **Authentication**: JWT-based authentication
- **Database**: Prisma ORM

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (for code execution service)
- Mistral AI API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vedantkhapre/code-quest-mini.git
   cd code-quest-mini
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```
   DATABASE_URL="file:./dev.db"
   PUBLIC_MISTRAL_API_KEY=mistral-key-goes-here
```
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

## Running the Project

### Start the Code Execution Server

```bash
# Using Docker
docker build -t code-execution-service -f Dockerfile.server .
docker run -p 5000:5000 code-execution-service

# Or directly
node src/server.js
```

### Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:4321`.

## Project Structure

```Project/Code-Quest/
├── src/
│   ├── assets/            # Static assets like SVGs
│   ├── components/        # React components
│   ├── layouts/           # Astro layouts
│   ├── lib/               # Utility functions
│   ├── pages/             # Page components and API routes
│   │   ├── api/           # API endpoints
│   │   └── ...            # Page components
│   ├── Questions/         # Challenge questions data
│   ├── styles/            # CSS styles
│   └── server.js          # Code execution server
└── ...
```

## Usage Instructions

### Solving Coding Challenges

1. Navigate to the main page
2. Browse through available questions using the navigation buttons
3. Write your solution in the code editor
4. Choose your programming language (C++ or Java)
5. Click "Run Code" to execute your solution
6. The system will automatically validate your answer against the expected output

### Using the AI Assistant

1. Click on the "AI Assistant" tab in the output panel
2. Ask programming-related questions
3. Get instant help with algorithms, debugging, and more

### Using the Markdown Editor

1. Navigate to the Markdown Editor tab
2. Create and edit your markdown content
3. Use the toolbar for formatting options
4. Upload images or export as PDF using the built-in tools

## Setting Up Database (Optional)

This project uses Prisma as an ORM. If you want to set up a database for user authentication and progress tracking:

1. Update the `DATABASE_URL` in your `.env` file
2. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Astro](https://astro.build/) for the web framework
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Mistral AI](https://mistral.ai/) for the AI assistant functionality
- [React Bootstrap](https://react-bootstrap.github.io/) for UI components

---

Happy coding!