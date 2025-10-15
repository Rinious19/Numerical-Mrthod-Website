import BaseRootOfEquation from "./BaseRootOfEquation";

//? class FalsePositionMethod สืบทอดมาจาก BisectionMethod
class FalsePositionMethod extends BaseRootOfEquation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state = {
      ...this.state, //* สืบทอด state เดิมจาก Parent
      title: "False Position Method",
    }
  }
  
  //@ Override Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    let xStart = Number(this.state.xStart);
    let xEnd = Number(this.state.xEnd);
    let tol = Number(this.state.tol);
    let xNew, error;
    let iter = 0;
    let iterations = [];
    //! ตรวจสอบเงื่อนไขเบื้องต้นเหมือน Bisection
    if (this.f(xStart) * this.f(xEnd) > 0) {
      //* คือ ไม่มีค่า Root ในช่วงนี้
      this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
      alert("f(xStart) and f(xEnd) should have opposite signs (a root may not exist in this interval).");
      return;
    }
    let xOld = xStart; //* กำหนดค่าเริ่มต้นเพื่อคำนวณ error ในรอบแรก
    do {
      let fxStart = this.f(xStart);
      let fxEnd = this.f(xEnd);
      //! สูตรการคำนวณของ False Position
      xNew = (xStart * fxEnd - xEnd * fxStart) / (fxEnd - fxStart);
      let fxNew = this.f(xNew);
      //* คำนวณค่า error(%)
      error = Math.abs((xNew - xOld) / xNew) * 100;
      //* เก็บข้อมูลแต่ละรอบในรูปแบบกลาง
      iterations.push({
        iter: ++iter,
        xk: xNew,
        fxk: fxNew,
        error: error,
      });
      //* ตรวจสอบเงื่อนไขเพื่อปรับช่วง xStart, xEnd
      if (fxStart * fxNew > 0) xStart = xNew;
      else xEnd = xNew;
      xOld = xNew;
    } while (error > tol);
    //! เมื่อคำนวณเสร็จแล้ว ให้เรียก method เพื่อเตรียมข้อมูลกราฟ
    this.prepareGraphData(iterations);
  };
}

export default FalsePositionMethod;

