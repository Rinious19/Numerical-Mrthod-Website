//* import Lib swagger-jsdoc เข้ามา เพื่อใช้สร้างเอกสารจาก JSDoc comments
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  //* ข้อมูลพื้นฐานของ API ทั้งระบบ
  definition: {
    openapi: '3.0.0', //* → ระบุว่าใช้มาตรฐาน OpenAPI 3.0
    info: { //* info → เก็บข้อมูลพื้นฐานของ API เช่นชื่อ, เวอร์ชัน, คำอธิบาย แสดงบนสุดของเว็บ
      title: 'Numerical Methods API',
      version: '1.0.0',
      description: 'API สำหรับโปรเจค Numerical Methods Calculator เพื่อจัดการข้อมูล Preset',
    },
    servers: [
      {
        url: 'http://localhost:8000', //* กำหนด server ที่ให้ Swagger ลองยิง API
        description: 'Development Server'
      },
    ],
  },
  //* ตำแหน่งของไฟล์ที่จะไปอ่าน JSDoc comments
  //* './server.js' คือไฟล์ server.js ที่อยู่ในโฟลเดอร์เดียวกันใน backend
  apis: ['./server.js'],  /* apis คือ array ของ path ที่บอกว่า “ไปอ่านไฟล์เหล่านี้ แล้วดึงทุก block 
                             ที่มี @swagger มาสร้างเอกสาร” */
};

const swaggerSpec = swaggerJsdoc(options); //* คำสั่งที่แปลง JSDoc → เอกสาร Swagger JSON
module.exports = swaggerSpec; 
//* ส่งออก (export) ตัวแปร swaggerSpec เพื่อให้ไฟล์อื่น (เช่น server.js) เอาไปใช้ได้

