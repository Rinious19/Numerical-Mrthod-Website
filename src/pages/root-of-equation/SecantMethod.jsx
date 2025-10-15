import React from "react";
import BaseRootOfEquation from "./BaseRootOfEquation";
import { Form, Button, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { evaluate } from 'mathjs';

class SecantMethod extends BaseRootOfEquation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state = {
        ...this.state,
        title: "Secant Method",
    }
  }

  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    let x0 = Number(this.state.xStart);
    let x1 = Number(this.state.xEnd);
    let tol = Number(this.state.tol);
    let maxIter = Number(this.state.maxIterations);
    let iter = 0;
    let error = 100;
    let iterations = [];
    do {
      let fx0 = this.f(x0);
      let fx1 = this.f(x1);
      //* ตรวจสอบเงื่อนไขพิเศษ (fx1 - fx0) ป้องกัน Division By Zero
      if (Math.abs(fx1 - fx0) < 1e-12) {
        this.setState({ iterations: [], plotData: null });
        alert("Denominator is zero (f(x₁) - f(x₀) ≈ 0). Secant method fails.");
        return;
      }
      //* ใช้สูตร Secant Method
      let x2 = x1 - (fx1 * (x1 - x0)) / (fx1 - fx0);
      error = Math.abs((x2 - x1) / x2) * 100;
      iterations.push({
        iter: ++iter,
        x0: x0,       //* เก็บ x₀ ไว้สำหรับวาดกราฟ
        x1: x1,       //* เก็บ x₁ ไว้สำหรับวาดกราฟ
        xk: x2,     //* เก็บ xk (x_i+1) ไว้สำหรับแสดงในตาราง
        fxk: this.f(x2),
        error: error,
      });
      //* อัปเดตค่าสำหรับรอบถัดไป
      x0 = x1;
      x1 = x2;
    } while (error > tol && iter < maxIter);
    
    this.prepareGraphData(iterations);
  };

  //@ Override: Method สำหรับเตรียมข้อมูลกราฟ
  prepareGraphData = (iterations) => {
    const allX = iterations.flatMap((i) => [i.x0, i.x1, i.xk]);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const buffer = (maxX - minX) * 0.2 || 1;
    const plotStart = minX - buffer;
    const plotEnd = maxX + buffer;
    let samplesFx = [];
    let graphStep = (plotEnd - plotStart) / 200;
    for (let x = plotStart; x <= plotEnd; x += graphStep) {
      samplesFx.push({ x: x, y: this.f(x) });
    }
    let convergencePathX = [];
    let convergencePathY = [];
    iterations.forEach((row) => {
      const x0 = row.x0;
      const fx0 = this.f(x0);
      const x1 = row.x1;
      const fx1 = this.f(x1);
      const x2 = row.xk;
      const fx2 = this.f(x2);
      convergencePathX.push(x1, x2, null);
      convergencePathY.push(fx1, fx2, null); 
    });
    const plotData = [
      { //* Trace 1: f(x)
        x: samplesFx.map((p) => p.x), y: samplesFx.map((p) => p.y),
        type: "scatter", mode: "lines", name: "f(x)", line: { color: "green" },
      },
      { //* Trace 2: จุด Iterations
        x: iterations.map((row) => row.xk), y: iterations.map((row) => row.fxk),
        type: "scatter", mode: "markers", name: "Iterations (xk)", marker: { color: "red", size: 8 },
      },
      { //* Trace 3: เส้น Secant
        x: convergencePathX, y: convergencePathY,
        type: "scatter", mode: "lines", name: "Convergence Path",
        line: { color: "orange" }
      },
    ];
    const plotLayout = {
      title: this.state.title,
      xaxis: { title: "x", range: [plotStart, plotEnd] },
      yaxis: { title: "f(x)" },
      dragmode: "pan", hovermode: "closest", responsive: true,
    };
    const precisionForError = this.state.tol.toString().split(".")[1]?.length || 2;
    this.setState({ iterations, plotData, plotLayout, precisionForError });
  };

  //@ Override: Form สำหรับรับข้อมูล
  renderForm = () => {
    const { fx, xStart, xEnd, tol } = this.state;
    //* Secant Method ต้องการ Input ครบทั้ง 4 ตัว
    const isButtonDisabled = !fx || xStart === "" || xEnd === "" || tol === "";
    return (
      <Form>
        <Row className="align-items-end mb-2">
          <Col md={7}>
            <Form.Group>
              <Form.Label>Equation f(x)</Form.Label>
              <Form.Control type="text" value={fx} onChange={(e) => this.setState({ fx: e.target.value })}/>
            </Form.Group>
          </Col>
          <Col md={5}>
            <div className="p-3 fs-5 border rounded bg-light h-100 mt-2 d-flex justify-content-start">
              <MathJax inline>{"\\(f(x) \\quad=\\quad\\) "}</MathJax>
              {fx ? (<MathJax inline>{` \\(${fx}\\)`}</MathJax>) : (<span className="ms-2">...</span>)}
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Initial Guess (x₀)</Form.Label>
              <Form.Control type="number" value={xStart} onChange={(e) => this.setState({ xStart: e.target.value })}/>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Initial Guess (x₁)</Form.Label>
              <Form.Control type="number" value={xEnd} onChange={(e) => this.setState({ xEnd: e.target.value })}/>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group className="mb-2">
              <Form.Label>Error Tolerance (%)</Form.Label>
              <Form.Control type="number" value={tol} step="0.0001" onChange={(e) => this.setState({ tol: e.target.value })}/>
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-center">
          <Button variant="primary" onClick={this.calculateMethod} className="w-25 mt-2 mx-2" disabled={isButtonDisabled}>
            Calculate
          </Button>
          <Button variant="success" onClick={this.fillForm} className="mt-2 mx-2">
            Fill Form
          </Button>
          <Button variant="danger" onClick={this.clearForm} className="mt-2 mx-2">
            Clear Form
          </Button>
        </div>
      </Form>
    );
  };
}

export default SecantMethod;
