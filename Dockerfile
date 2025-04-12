FROM ubuntu:22.04

# Install compilers and dependencies
RUN apt-get update && apt-get install -y \
    g++ \
    openjdk-17-jdk \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Install npm dependencies
COPY package.json package-lock.json* ./
RUN npm install express body-parser cors

# Create directory for code execution with proper permissions
RUN mkdir -p /tmp/code_execution && chmod 777 /tmp/code_execution

# Copy server code
COPY src/server.js ./src/

# Expose port
EXPOSE 5000

# Command to run the server
CMD ["node", "src/server.js"]