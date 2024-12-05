# Use an official Node runtime as the base image
FROM node:18

# Set the timezone
ENV TZ=Asia/Bangkok

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application code
COPY . .

# Build the TypeScript code
RUN npm run build

# List contents of dist directory to verify build
RUN ls -la dist

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]