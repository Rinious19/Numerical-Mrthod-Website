import BaseRootOfEquation from "./BaseRootOfEquation" //* Assuming the base class is in the same folder
import { Form, Button, Table, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";

//? Class OnePointIterationMethod สืบทอดจาก BaseRootOfEquation
class OnePointIterationMethod extends BaseRootOfEquation {
  //@ Constructor 
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state = {
      ... this.state,
      title: "One Point Iteration Method",
    }
  }

  //@ Override the main calculation logic → ทำหน้าที่คำนวณหา Root เท่านั้น
  calculateMethod = () => {
    let xOld = Number(this.state.xStart);
    let tol = Number(this.state.tol);
    let maxIter = Number(this.state.maxIterations);
    let xNew = 0;
    let error = 100;
    let iter = 0;
    let iterations = [];
    do {
      if (iter >= maxIter) {
        this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
        alert("Method did not converge within max iterations.");
        return;
      }
      xNew = this.f(xOld);               //* isFinite() ตัวเลขที่จำกัด เช่น 0 -5 9 คืนค่า true
      if (isNaN(xNew) || !isFinite(xNew)) {         //* ตัวเลขที่ไม่จำกัด เช่น inf, -inf, NaN  คืนค่า false 
        this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
        alert("Calculation resulted in NaN or Infinity. Check g(x).");
        return;
      }
      error = Math.abs((xNew - xOld) / xNew) * 100;
      iterations.push({ iter: ++iter, xOld, xNew, error });
      xOld = xNew;
    } while (error > tol);
    //! เมื่อคำนวณเสร็จแล้ว ให้เรียก method เพื่อเตรียมข้อมูลกราฟ
    this.prepareGraphData(iterations);
  };

  //@ Override: Method for preparing graph data
  //* ทำหน้าที่เตรียมข้อมูลสำหรับกราฟโดยเฉพาะ
  prepareGraphData = (iterations) => {
    const allX = iterations.flatMap((i) => [i.xOld, i.xNew]); //* ดึงค่า x ทั้งหมด (ทั้ง xOld และ xNew จากทุกรอบ)
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const buffer = (maxX - minX) * 0.2; //* คำนวณ "พื้นที่ว่าง" เพิ่มเติม เพื่อไม่ให้กราฟดูอึดอัดจนเกินไป
    //* กำหนดจุดเริ่มต้นและจุดสิ้นสุดของแกน X ที่จะใช้พล็อตกราฟโดยการบวก/ลบ buffer เข้าไป
    const plotStart = minX - buffer;
    const plotEnd = maxX + buffer;
    let samplesGx = []; //* เก็บข้อมูล {x,y: this.f(x)} ไปสร้างกราฟ g(x)
    let graphStep = (plotEnd - plotStart) / 200;
    for (let x = plotStart; x <= plotEnd; x += graphStep) {
      samplesGx.push({ x, y: this.f(x) });
    }
    //* การสร้างเส้น "Convergence Path"
    let onePointPathX = []; //* เก็บค่า x
    let onePointPathY = []; //* เก็บค่า y
    iterations.forEach((row) => {
      //* จากจุด (xOld, xNew) ไปยัง (xNew, xNew): นี่คือ เส้นแนวนอน จากเส้นโค้ง g(x) กลับมายังเส้น y=x
      //* จากจุด (xNew, xNew) ไปยัง (xOld, xNew): นี่คือ เส้นแนวตั้ง จากเส้น y=x ขึ้นไปหาเส้นโค้ง g(x)
      onePointPathX.push(row.xOld, row.xNew); 
      onePointPathY.push(row.xNew, row.xNew);
    });
    onePointPathX.unshift(iterations[0].xOld); //* เพิ่มจุด (x₀, x₀) เข้าไปเป็น จุดเริ่มต้น ของเส้นทางทั้งหมด
    onePointPathY.unshift(iterations[0].xOld);
    const plotData = [
      { //* trace 1: g(x)
        x: samplesGx.map((p) => p.x),
        y: samplesGx.map((p) => p.y),
        mode: "lines",
        name: "g(x)",
        line: { color: "green" },
      },
      { //* trace 2: y = x
        x: [plotStart, plotEnd],
        y: [plotStart, plotEnd],
        mode: "lines",
        name: "y = x",
        line: { color: "blue", dash: "dash" },
      },
      { //* trace 3: One-Point Path
        x: onePointPathX,
        y: onePointPathY,
        mode: "lines+markers", //* ลากเส้นเชื่อมจุด
        name: "Convergence Path",
        line: { color: "red" },
        marker: { size: 6 },
      },
    ];
    const plotLayout = {
      title: "One-Point Iteration Convergence",
      xaxis: { title: "x" },
      yaxis: { title: "g(x)" },
      responsive: true,
      dragmode: "pan",
      hovermode: "closest",
    };
    const precisionForError = this.state.tol.toString().split(".")[1]?.length || 4;
    //! อัปเดต state ทั้งหมดในครั้งเดียวเพื่อให้ React render ใหม่
    this.setState({ iterations, plotData, plotLayout, precisionForError });
  };

  //@ Override the form rendering → สร้างฟอร์มสำหรับรับ Input ของ Method นี้โดยเฉพาะ
  renderForm = () => {
    const { fx, xStart, tol } = this.state; //* 1. ดึงค่า state ที่จำเป็นออกมา
    //* 2. สร้างเงื่อนไขเพื่อตรวจสอบว่ามี Field ไหนว่างหรือไม่
    const isButtonDisabled = fx === '' || xStart === '' || tol === '';  
    return (
      <Form>
        <Row className="align-items-end mb-2">
          <Col md={7}>
            <Form.Group>
              <Form.Label>g(x<sub>i</sub>) [in form x<sub>i</sub> = g(x<sub>i</sub>)]</Form.Label>
              <Form.Control 
                type="text" 
                value={this.state.fx} 
                onChange={(e) => this.setState({ fx: e.target.value })} 
              />
            </Form.Group>
          </Col>
          {/* ส่วน Preview Box */}
          <Col md={5}>
            <div className="p-3 fs-5 border rounded bg-light h-100 mt-2 d-flex justify-content-start">
              {/* ใช้ MathJax แสดง f(x) = เสมอ */}
              <MathJax inline>{"\\(f(x) \\quad=\\quad\\) "}</MathJax>
              {/* ตรวจสอบเงื่อนไขเพื่อแสดงสมการหรือ ... */}
              {this.state.fx ? (
                // ถ้ามี fx ให้แสดงสมการ
                <MathJax inline>{` \\(${this.state.fx}\\)`}</MathJax>
              ) : (
                // ถ้า fx ว่าง ให้แสดง ... แบบจางๆ
                <span className="ms-2">...</span>
              )}
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Initial Guess (x₀)</Form.Label>
              <Form.Control
                type="number"
                value={this.state.xStart}
                onChange={(e) => this.setState({ xStart: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Error Tolerance (%)</Form.Label>
              <Form.Control
                type="number"
                value={this.state.tol}
                step="0.0001"
                onChange={(e) => this.setState({ tol: e.target.value })}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-center">
          <Button
            variant="primary"
            onClick={this.calculateMethod}
            className="w-25 mt-2"
            disabled={isButtonDisabled}
          >
            Calculate
          </Button>
          <Button 
            variant="success" 
            //* แก้ไข onClick ให้เรียกใช้ฟังก์ชันจาก Base โดยตรง
            onClick={this.fillForm} 
            className="mt-2 mx-2"
          >
            Fill Form
          </Button>
          <Button 
            variant="danger"
            onClick={this.clearForm}
            className="mt-2 mx-2"
          >
            Clear Form
          </Button>
        </div>
      </Form>
    );
  };
  
  //@ Override the table rendering → สร้างตารางสำหรับแสดงผลลัพธ์ของ Method นี้โดยเฉพาะ
  renderTable = () => {
    return (
      <Table hover borderless className="table-equal-width">
        <thead className="table-light">
          <tr className="text-start">
            <th>Iter</th>
            <th>x<sub>i+1</sub></th>
            <th>Error (%)</th>
          </tr>
        </thead>
        <tbody>
          {this.state.iterations.map((row) => (
            <tr key={row.iter} className="text-start">
              <td>{row.iter}</td>
              <td>{row.xNew.toFixed(6)}</td>
              <td>{row.error.toFixed(this.state.precisionForError)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
}

export default OnePointIterationMethod;
