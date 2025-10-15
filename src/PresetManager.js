import axios from 'axios';

//* ดึง URL ของ API Server จาก Environment Variable (ไฟล์ .env ของ React)
//* ถ้าไม่เจอ จะใช้ http://localhost:8000 เป็นค่า default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

//@ ฟังก์ชันสำหรับสุ่มดึงข้อมูล Preset จาก Collection ที่ระบุ
//* returns {Promise<object|null>} ข้อมูล Preset ที่สุ่มได้ หรือ null ถ้าเกิดข้อผิดพลาด
//* param {string} collectionName - ชื่อของ Collection ที่ต้องการดึงข้อมูล
export const fetchRandomPreset = async (collectionName) => {
  try {
    //* ใช้ axios ยิง GET Request ไปยัง Endpoint ที่เราสร้างไว้ใน server.js
    //* เช่น http://localhost:8000/api/presets/random/rootofequationpresets
    const response = await axios.get(`${API_URL}/api/presets/random/${collectionName.toLowerCase()}`);
    console.log("ดึงข้อมูลสุ่มสำเร็จ:", response.data);
    return response.data; //* ส่งข้อมูลที่ได้กลับไปให้ Component
  } catch (error) { //* แจ้งเตือนเมื่อ error
    console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error.response ? error.response.data : error.message);
    alert("เกิดข้อผิดพลาดในการดึงข้อมูลจาก API Server กรุณาตรวจสอบว่า Server ทำงานอยู่หรือไม่");
    return null; //* ส่งค่า null กลับไปเมื่อเกิด Error 
  }
};

