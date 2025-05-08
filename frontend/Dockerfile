
# ---- Stage 1: Build the app ----
    FROM node:19-alpine AS build

    # Set the working directory inside the container
    WORKDIR /app
    
    # Copy package.json and package-lock.json to leverage Docker caching
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Remove any stale `.next` folder
    RUN rm -rf .next
    
    # Copy the rest of the application source code
    COPY . . 
    
    # Verify that `pages` exists (for debugging)
    RUN ls -al /app/pages
    
    # Build the Next.js app
    RUN npm run build --verbose
    
    # ---- Stage 2: Create a lightweight runtime image ----
    FROM node:19-alpine AS runtime
    
    # Set the working directory in the new image
    WORKDIR /app
    # First, copy the required files BEFORE running npm install
    COPY --from=build /app/package.json ./package.json
    COPY --from=build /app/node_modules ./node_modules
    # RUN npm ci --production
    RUN npm install --omit=dev

    # Copy only the necessary files from the build stage
    COPY --from=build /app/.next .next
    COPY --from=build /app/public ./public
    COPY --from=build /app/package.json ./package.json
    COPY --from=build /app/node_modules ./node_modules
    
    # Ensure next.config.js and next-i18next.config.js are included
    COPY ./next.config.js ./next.config.js
    COPY ./next-i18next.config.js ./next-i18next.config.js
    
    # Set environment variables for production
    # ENV NODE_ENV=production
    
    # Expose the port that the app will run on
    EXPOSE 3000
    
    # Start the app in production mode
    CMD ["npm", "run", "start"]

    
# # ---- Stage 1: Build the app ----
#     FROM node:19-alpine AS build

#     # Set the working directory inside the container
#     WORKDIR /app
    
#     # Copy package.json and package-lock.json to leverage Docker caching
#     COPY package*.json ./
    
#     # Install dependencies
#     RUN npm ci
    
#     # Copy the rest of the source code
#     # COPY . .
    
#     RUN rm -rf .next
    
#     # Copy the rest of the application source code
#     COPY . . 

#     # Verify that `pages` exists
#     RUN ls -al /app/pages


#     # Build the Next.js app
#     RUN npm run build
    
#     # ---- Stage 2: Create a lightweight runtime image ----
#     FROM node:19-alpine AS runtime
    
#     # Set the working directory in the new image
#     WORKDIR /app
    
#     # Copy the built app and production dependencies from the build stage
#     COPY --from=build /app/.next .next
#     COPY --from=build /app/public ./public
#     COPY --from=build /app/package.json ./package.json
#     COPY --from=build /app/node_modules ./node_modules
    
#     # Ensure next-i18next.config.js is included
#     COPY ./next.config.js ./next.config.js
#     COPY ./next-i18next.config.js ./next-i18next.config.js
    
#     # Expose the port that the app will run on
#     EXPOSE 3000
    
#     # Start the app
#     CMD ["npm", "run", "start"]

    
# # ---- Stage 1: Build the app ----
#     FROM node:19-alpine AS build

#     # Set the working directory inside the container
#     WORKDIR /app
    
#     # Copy package.json and package-lock.json to leverage Docker caching
#     COPY package*.json ./
    
#     # Install dependencies
#     RUN npm ci
    
#     # Copy the rest of the source code
#     COPY . .
    
#     # Build the Next.js app
#     RUN npm run build
    
#     # ---- Stage 2: Create a lightweight runtime image ----
#     FROM node:19-alpine AS runtime
    
#     # Set the working directory in the new image
#     WORKDIR /app
    
#     # Install only production dependencies
#     COPY package*.json ./
#     RUN npm ci --production
    
#     # Copy all built files and required files from the build stage
#     COPY --from=build /app /app
#     # # Copy the built app and necessary files from the build stage
#     # COPY --from=build /app/.next .next
#     # COPY --from=build /app/public ./public
#     # COPY --from=build /app/node_modules ./node_modules
#     # COPY --from=build /app/package.json ./package.json
#     # # Copy the pages directory for routing
#     # COPY --from=build /app/pages ./pages
#     # COPY --from=build /app/styles ./styles        
#     # COPY --from=build /app/tsconfig.json ./
#     # COPY --from=build /app/utils ./utils           
#     # COPY --from=build /app/lib ./lib        
#     # COPY --from=build /app/types ./types     
#     # COPY --from=build /app/styles ./styles        
#     # COPY ./next-i18next.config.js ./next-i18next.config.js
#     # Ensure next-i18next.config.js is included
#     COPY ./next-i18next.config.js ./next-i18next.config.js
#     # Expose the port that the app will run on
#     EXPOSE 3000
    
#     # Start the app
#     CMD ["npm", "run", "start"]
    
    

    