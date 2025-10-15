//@ ส่วนที่ 1: การ Import และตั้งค่าเริ่มต้น
require('dotenv').config(); //* ทำให้ Server สามารถอ่านค่าจากไฟล์ .env ได้
const express = require('express');
const mongoose = require('mongoose');
//? เพิ่ม Import สำหรับ Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig'); //* Import config ที่เราสร้างไว้
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000; //* Port ที่ Server จะทำงาน (ปกติคือ 8000)

//@ ส่วนที่ 2: Middleware (ตัวกลางจัดการคำขอ)
//* ตั้งค่า CORS ให้รับ Request จาก Client ที่ระบุไว้ใน .env เท่านั้น (localhost:5173) (ใช้ VITE)
app.use(cors({
    origin: process.env.CLIENT_URL 
}));
app.use(express.json()); //* ทำให้ Server อ่านข้อมูล JSON ที่ส่งมากับ Request ได้
/* - สร้าง Route (เส้นทาง) ในเว็บเซิร์ฟเวอร์ Express ให้เปิดหน้า Swagger UI ที่จะใช้ดู “เอกสาร API ทั้งหมด”
     แบบสวย ๆ และกดทดสอบ API ได้เลย 
   - หน้า Document จะอยู่ที่ http://localhost:8000/api-docs  */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//@ ส่วนที่ 3: การเชื่อมต่อฐานข้อมูล MongoDB
//* Mongoose จะอ่าน "ที่อยู่" ของ Database จากไฟล์ .env โดยอัตโนมัติ
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB connected successfully!");
    //? ลบการเรียกใช้ฟังก์ชัน insertInitialData ออก
})
.catch(err => console.error("❌ MongoDB connection error:", err));

//@ ส่วนที่ 4: การสร้าง "พิมพ์เขียว" (Schema) และ "โมเดล" (Model)
//? สร้าง Schema ที่ยืดหยุ่นและวางไว้ก่อนสร้าง Model
//* Schema คือโครงสร้างของข้อมูลที่จะเก็บใน Collection
const presetSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    fx: { type: String },
    // Fields สำหรับ Root of Equation
    xStart: Number,
    xEnd: Number,
    tol: Number,
    // Fields สำหรับ Integration
    lowerBound: Number,
    upperBound: Number,
    segments: Number,
    // Fields สำหรับ Differentiation
    x: Number,
    h: Number,
});

//* Model คือเครื่องมือที่ใช้ในการโต้ตอบกับ Collection ใน Database
//* รูปแบบ: mongoose.model('ชื่อModelในโค้ด', schema, 'ชื่อCollectionในDB')
const RootOfEquationPreset = mongoose.model('RootOfEquationPreset', presetSchema, 'rootofequationpresets');
const IntegrationPreset = mongoose.model('IntegrationPreset', presetSchema, 'integrationpresets');
const DifferentiationPreset = mongoose.model('DifferentiationPreset', presetSchema, 'differentiationpresets');


//? เพิ่ม JSDoc Comment สำหรับ Swagger
/**
 * @swagger
 * tags:
 *   - name: Presets
 *     description: API สำหรับจัดการข้อมูลตัวอย่าง (Presets)
 */

/**
 * @swagger
 * /api/presets/random/{collectionName}:
 *   get:
 *     summary: สุ่มข้อมูล Preset จาก Collection ที่ระบุ
 *     description: ดึงข้อมูลเอกสาร (document) แบบสุ่ม 1 รายการจาก Collection ที่ระบุใน MongoDB
 *     tags: [Presets]
 *     parameters:
 *       - in: path
 *         name: collectionName
 *         required: true
 *         description: ชื่อของ Collection ที่ต้องการดึงข้อมูล
 *         schema:
 *           type: string
 *           enum: [rootofequationpresets, integrationpresets, differentiationpresets]
 *           example: rootofequationpresets
 *     responses:
 *       '200':
 *         description: ดึงข้อมูลสำเร็จ ส่งข้อมูล Preset ที่สุ่มได้กลับไป
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 64a5abc123
 *                 id:
 *                   type: string
 *                   example: Bisection-Example
 *                 fx:
 *                   type: string
 *                   example: x^4 - 13
 *       '404':
 *         description: ไม่พบ Collection ที่ระบุ หรือ Collection นั้นว่างเปล่า
 *       '500':
 *         description: เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์
 */

//@ ส่วนที่ 5: การสร้าง API Endpoint (ช่องทางให้ Frontend ติดต่อ)
//* Endpoint หลักสำหรับ "สุ่ม" ข้อมูล Preset
//* เช่น GET http://localhost:8000/api/presets/random/rootOfEquationPresets
app.get('/api/presets/random/:collectionName', async (req, res) => {
  const collectionName = req.params.collectionName.toLowerCase();
  console.log('📦 Collection requested:', collectionName);
  try {
    //* ดึง collection ที่มีอยู่แล้วจาก MongoDB โดยตรง
    const collection = mongoose.connection.collection(collectionName);
    //* ตรวจสอบว่ามี collection นี้อยู่จริงไหม
    const collections = await mongoose.connection.db.listCollections().toArray();
    const exists = collections.some(col => col.name.toLowerCase() === collectionName);
    if (!exists) {
      return res.status(404).json({ message: `Collection '${collectionName}' not found.` });
    }
    //* ใช้ aggregate เพื่อสุ่ม document หนึ่งตัว
    const randomPreset = await collection.aggregate([{ $sample: { size: 1 } }]).toArray();
    if (randomPreset.length > 0) {
      res.json(randomPreset[0]);
    } else {
      res.status(404).json({ message: `No presets found in collection '${collectionName}'.` });
    }
  } catch (err) {
    console.error('❌ Error fetching random preset:', err);
    res.status(500).json({ error: err.message });
  }
});

//@ ส่วนที่ 6: การเริ่มทำงานของ Server
app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
    console.log(`📄 Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

