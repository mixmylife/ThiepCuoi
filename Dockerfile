# Sử dụng Node.js bản 20 (hoặc bản bạn muốn)
FROM node:20-alpine

# Set thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy toàn bộ mã nguồn
COPY . .

# Expose port mặc định
EXPOSE 3000

# Chạy server
CMD ["node", "server.js"]
