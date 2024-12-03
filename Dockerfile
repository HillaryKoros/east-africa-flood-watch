# File: Dockerfile
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy entire src directory
COPY src/ .

# Expose port
EXPOSE 80

# Default nginx command
CMD ["nginx", "-g", "daemon off;"]