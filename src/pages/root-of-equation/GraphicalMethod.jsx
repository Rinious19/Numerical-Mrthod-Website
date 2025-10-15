import React from "react";
import BaseRootOfEquation from "./BaseRootOfEquation";
import { Form, Button, Row, Col, Table } from "react-bootstrap";

//? class GraphicalMethod สืบทอดมาจาก BaseRootOfEquation
class GraphicalMethod extends BaseRootOfEquation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state = {
      ... this.state,
      title: "Graphical Method",
    }
  }
   
  //@ Override Method หลักสำหรับการคำนวณ (ใช้ Logic ใหม่)
  calculateMethod = () => {
    let xStart = Number(this.state.xStart);
    let xEnd = Number(this.state.xEnd); 
    let tol = Number(this.state.tol);
    let iterations = []; //* เก็บข้อมูลของแต่ละรอบการคำนวณ iter, xk, ... 
    let iter = 0;
    let found = false;
    let step = 1.0; //* เริ่มต้นด้วย Step ขนาดใหญ่
    let currentXStart = xStart; //* ใช้เป็น "จุดเริ่มต้น" ของการค้นหา root ในแต่ละรอบของการลดขนาด step
    //* วนลูปด้านนอกเพื่อลดขนาด Step
    for (let i = 0; i < 10; i++) {
      //* จำกัดการลด step เพื่อป้องกัน loop Infinity
      let prevY = this.f(currentXStart); //* เก็บค่า f(x) ของจุดก่อนหน้า (รอบที่แล้ว) ใช้เปรียบเทียบกับค่า f(x) ของจุดปัจจุบัน (y)
      //* เพิ่มจุดเริ่มต้นเข้าไปในตารางแค่ครั้งแรก
      if (i === 0) {
        iterations.push({
          iter: ++iter,
          xk: currentXStart,
          fxk: prevY,
          error: Math.abs(prevY)*100,
        });
      }
      //? วนลูปด้านในเพื่อไล่หาในช่วงด้วย Step ปัจจุบัน
      for (let x = currentXStart + step; x <= xEnd + step; x += step) {
        let y = this.f(x);
        let error = Math.abs(y)*100
        iterations.push({ iter: ++iter, xk: x, fxk: y, error: error});
        if (error < tol) {
          found = true;
          break;
        }
        //* ตรวจสอบการเปลี่ยนเครื่องหมาย
        if (y * prevY < 0) {
          //* ถ้าเจอ ให้ย้อนกลับไปจุดก่อนหน้า และเตรียมลดขนาด step ในรอบถัดไป
          currentXStart = x - step;
          step /= 10.0;
          break; //* ออกจาก loop ในเพื่อเริ่มรอบใหม่ด้วย step ที่เล็กลง
        }
        prevY = y;
      }
      if (found) {
        break; //* ออกจาก loop นอกถ้าเจอคำตอบแล้ว
      }
    }
    if (!found) {
      alert("No root found in the specified interval or the solution did not converge to the desired accuracy.");
      this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
      return;
    }
    //! เมื่อคำนวณเสร็จแล้ว ให้เรียก method เพื่อเตรียมข้อมูลกราฟ
    this.prepareGraphData(iterations);
  };
}

export default GraphicalMethod;
