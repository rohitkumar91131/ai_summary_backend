# Step 1: Use an official Node image as the base
FROM node:20

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy the rest of your backend code
COPY . .

# Step 5: Expose your backend port
EXPOSE 3000

# Step 6: Start the app
CMD ["node", "app.js"]
