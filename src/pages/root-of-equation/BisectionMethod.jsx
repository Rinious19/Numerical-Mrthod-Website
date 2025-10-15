import React from "react";
import BaseRootOfEquation from "./BaseRootOfEquation";
import { Form, Button, Row, Col, Table } from "react-bootstrap";

//? class BisectionMethod สืบทอดมาจาก BaseRootOfEquation
class BisectionMethod extends BaseRootOfEquation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state = {
      ...this.state,   //* สืบทอด state เดิมจาก Parent
      title: "Bisection Method",
    };
  }
  
  //@ Override Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    let xStart = Number(this.state.xStart);
    let xEnd = Number(this.state.xEnd);
    let tol = Number(this.state.tol);
    let xMidNew, error;
    let iter = 0;
    let iterations = [];
    //! ตรวจสอบเงื่อนไขเบื้องต้นของ Bisection
    if (this.f(xStart) * this.f(xEnd) > 0) {
      //* คือ ไม่มีค่า Root ในช่วงนี้
      this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
      alert("f(xStart) and f(xEnd) should have opposite signs (a root may not exist in this interval).");
      return;
    }
    let xMidOld = xStart; //* กำหนดค่าเริ่มต้นเพื่อคำนวณ error ในรอบแรก
    do {
      xMidNew = (xStart + xEnd) / 2;
      let fxMid = this.f(xMidNew);
      //* คำนวณค่า error(%)
      error = Math.abs((xMidNew - xMidOld) / xMidNew) * 100;
      //* เก็บข้อมูลแต่ละรอบในรูปแบบที่ละเอียดขึ้นสำหรับ Bisection
      iterations.push({
        iter: ++iter,
        xk: xMidNew,
        fxk: fxMid,
        error: error,
      });
      //* ตรวจสอบเงื่อนไขเพื่อปรับช่วง xStart, xEnd
      if (this.f(xStart) * fxMid > 0) xStart = xMidNew;
      else xEnd = xMidNew;
      xMidOld = xMidNew;
    } while (error > tol);
    //! เมื่อคำนวณเสร็จแล้ว ให้เรียก method เพื่อเตรียมข้อมูลกราฟ
    this.prepareGraphData(iterations);
  };
}

export default BisectionMethod;