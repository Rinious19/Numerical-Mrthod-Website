#? Docker for Frontend
#@ STAGE 1: Build Stage
#* สร้าง "ตู้คอนเทนเนอร์" ชั่วคราวสำหรับ Build โปรเจค React
FROM node:18-alpine AS builder 

#* ตั้งค่า Working Directory
WORKDIR /app
#* คัดลอกไฟล์ package.json และติดตั้ง dependencies
COPY package*.json ./
RUN npm install

#* คัดลอกโค้ดทั้งหมด
COPY . .

#* รันคำสั่ง build เพื่อสร้างโฟลเดอร์ dist
RUN npm run build

#@ STAGE 2: Production Stage
#* สร้าง "ตู้คอนเทนเนอร์" ของจริงสำหรับเสิร์ฟไฟล์
#* เราใช้ Nginx ซึ่งเป็น Web Server ที่เล็กและมีประสิทธิภาพสูงมาก
FROM nginx:stable-alpine

#* คัดลอก "เฉพาะ" โฟลเดอร์ dist ที่ build เสร็จแล้วจากตู้แรก (builder)
#* ไปวางในตำแหน่งที่ Nginx ใช้เสิร์ฟไฟล์
COPY --from=builder /app/dist /usr/share/nginx/html

#* บอก Docker ว่า Nginx จะเปิดประตูหมายเลข 80
EXPOSE 80

#* คำสั่งเริ่มต้นของ Nginx (ไม่ต้องแก้ไข)
CMD ["nginx", "-g", "daemon off;"]
