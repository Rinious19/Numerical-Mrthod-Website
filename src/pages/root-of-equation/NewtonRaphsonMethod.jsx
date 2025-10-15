import BaseRootOfEquation from "./BaseRootOfEquation";
import { Form, Button, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { evaluate, derivative } from "mathjs";

class NewtonRaphsonMethod extends BaseRootOfEquation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state = {
      ...this.state,
      title: "Newton Raphson Method",
    };
  }

  //@ Override the main calculation logic → ทำหน้าที่คำนวณหา Root เท่านั้น
  calculateMethod = () => {
    let xOld = Number(this.state.xStart);
    let tol = Number(this.state.tol);
    let maxIter = Number(this.state.maxIterations);
    let iter = 0;
    let error = 100;
    let iterations = [];
    try {
      //* สร้างฟังก์ชัน f'(x) อัตโนมัติ
      const fPrime = (x) => evaluate(derivative(this.state.fx, "x").toString(), { x });
      do {                       //* derivative(สมการ, ตัวแปร)
        let fx = this.f(xOld);
        let fpx = fPrime(xOld);
        //* ตรวจสอบเงื่อนไขพิเศษ (fpx >= 1e - 12) ป้องกัน Division By Zero
        if (Math.abs(fpx) < 1e-12) {
          this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
          alert("Derivative is zero. Newton-Raphson method fails.");
          return;
        }
        let xNew = xOld - fx / fpx; //* ใช้สูตร Newton-Raphson
        error = Math.abs((xNew - xOld) / xNew) * 100;
        iterations.push({
          iter: ++iter, 
          xOld,     //* เก็บไว้สำหรับวาดกราฟ Path Convergence
          xk: xNew, //* เก็บไว้สำหรับแสดงในตาราง
          fxk: this.f(xNew),
          error,
        });
        xOld = xNew;
      } while (error > tol && iter < maxIter);
      this.prepareGraphData(iterations); //* ส่งผลลัพธ์ไปสร้างกราฟ
    } catch (error) { //! จัดการ Error ถ้าหาอนุพันธ์ไม่ได้
      alert("Could not differentiate the function. Please check the syntax of f(x).");
      this.setState({ iterations: [], plotData: null }); //* ล้างค่าเก่าออก
      console.error("Differentiation Error:", error);
    }
  };

  //@ Override: Method for preparing graph data
  prepareGraphData = (iterations) => {
    //* Logic ส่วนนี้เหมือน One Point Iteration
    const allX = iterations.flatMap((i) => [i.xOld, i.xk]);
    const minX = Math.min(...allX, Number(this.state.xStart));
    const maxX = Math.max(...allX, Number(this.state.xStart));
    const buffer = (maxX - minX) * 0.2 || 1;
    const plotStart = minX - buffer;
    const plotEnd = maxX + buffer;
    let samplesFx = [];
    let graphStep = (plotEnd - plotStart) / 200;
    for (let x = plotStart; x <= plotEnd; x += graphStep) {
      samplesFx.push({ x: x, y: this.f(x) });
    }
    //* Logic การสร้าง Convergence Path
    let convergencePathX = [];
    let convergencePathY = [];
    iterations.forEach((row) => {
      const xOld = row.xOld;
      const fxOld = this.f(xOld);
      const xNew = row.xk; 
      //* สร้างเส้นสัมผัสจาก (xOld, fxOld) ไปยัง (xNew, 0) และมี (null, null) คั่นไว้ 
      convergencePathX.push(xOld, xNew, null); //* null ทำให้เส้นของแต่ละ Iteration ไม่เชื่อมต่อกัน
      convergencePathY.push(fxOld, 0, null);
    });
    //* เพิ่มข้อมูลลลงกราฟ
    const plotData = [
      {
        //* Trace 1: f(x)
        x: samplesFx.map((p) => p.x),
        y: samplesFx.map((p) => p.y),
        type: "scatter",
        mode: "lines",
        name: "f(x)",
        line: { color: "green" },
      },
      {
        //* Trace 2: จุด Iterations
        x: iterations.map((row) => row.xk),
        y: iterations.map((row) => row.fxk),
        type: "scatter",
        mode: "markers",
        name: "Iterations (xk)",
        marker: { color: "red", size: 8 },
      },
      {
        //* Trace 3: เส้นทางการลู่เข้า
        x: convergencePathX,
        y: convergencePathY,
        type: "scatter",
        mode: "lines",
        name: "Convergence Path",
        line: { color: "orange" },
      },
    ];
    const plotLayout = {
      title: this.state.title,
      xaxis: { title: "x", range: [plotStart, plotEnd] },
      yaxis: { title: "f(x)" },
      dragmode: "pan",
      hovermode: "closest",
      responsive: true,
    };
    const precisionForError =
      this.state.tol.toString().split(".")[1]?.length || 2;
    this.setState({ iterations, plotData, plotLayout, precisionForError });
  };

  renderForm = () => {
    const { fx, xStart, tol } = this.state;
    const isButtonDisabled = !fx || xStart === "" || tol === "";
    return (
      <Form>
        <Row className="align-items-end mb-2">
          <Col md={7}>
            <Form.Group>
              <Form.Label>Equation f(x)</Form.Label>
              <Form.Control
                type="text"
                value={fx}
                onChange={(e) => this.setState({ fx: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <div className="p-3 fs-5 border rounded bg-light h-100 mt-2 d-flex justify-content-start">
              <MathJax inline>{"\\(f(x) \\quad=\\quad\\) "}</MathJax>
              {fx ? (
                <MathJax inline>{` \\(${fx}\\)`}</MathJax>
              ) : (
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
                value={xStart}
                onChange={(e) => this.setState({ xStart: e.target.value })}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Error Tolerance (%)</Form.Label>
              <Form.Control
                type="number"
                value={tol}
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
            className="w-25 mt-2 mx-2"
            disabled={isButtonDisabled}
          >
            Calculate
          </Button>
          <Button
            variant="success"
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
}

export default NewtonRaphsonMethod;
