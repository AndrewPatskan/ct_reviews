FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4200

# Run Angular dev server and bind to all host interfaces
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
