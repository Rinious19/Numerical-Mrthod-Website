import React from "react";
import BaseInterpolation from "./BaseInterpolation";
import { Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { format, lusolve } from "mathjs";

class SplineInterpolation extends BaseInterpolation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Spline Interpolation";
    this.state.splineType = 'linear'; //* ประเภท Spline เริ่มต้น
  }

  //? Helper Functions & State Handlers
  //@ Method: จัดการเมื่อมีการเปลี่ยนแปลงประเภทของ Spline
  handleSplineTypeChange = (event) => {
    this.setState({ splineType: event.target.value, solution: null });
  }

  //? Override Calculation Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { points, targetX, splineType } = this.state;
    const numPoints = points.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    const numTargetX = parseFloat(targetX);
    if (numPoints.some(p => isNaN(p.x) || isNaN(p.y)) || isNaN(numTargetX)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    //* เรียงลำดับจุดตามค่า x เพื่อให้หาช่วงได้ง่าย
    numPoints.sort((a, b) => a.x - b.x);
    let solutionSteps;
    try {
      //* ตรวจสอบว่า targetX อยู่ในขอบเขตของข้อมูลหรือไม่ก่อนเริ่มคำนวณ
      if (numTargetX < numPoints[0].x || numTargetX > numPoints[numPoints.length - 1].x) {
        throw new Error("Target X is outside the range of the given data points.");
      }
      switch (splineType) {
        case 'linear':
          solutionSteps = this.calculateLinearSpline(numPoints, numTargetX);
          break;
        case 'quadratic':
          solutionSteps = this.calculateQuadraticSpline(numPoints, numTargetX);
          break;
        case 'cubic':
          solutionSteps = this.calculateCubicSpline(numPoints, numTargetX);
          break;
        default:
          alert("Invalid spline type selected.");
          return;
      }
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert(error.message || "An error occurred during calculation.");
      this.setState({ solution: null });
      console.error(error);
    }
  };
  
  //? Calculation Logic for Each Spline Type (BUG FIXED)
  findInterval = (points, targetX) => {
    //* Logic การหาช่วงที่เสถียรกว่า
    for (let i = 0; i < points.length - 1; i++) {
        if (targetX >= points[i].x && targetX <= points[i+1].x) {
            return i;
        }
    }
    //* คืนค่า index สุดท้ายถ้า targetX ตรงกับจุดสุดท้ายพอดี
    if (targetX === points[points.length - 1].x) {
        return points.length - 2;
    }
    return -1; //* ไม่ควรเกิดขึ้นถ้าผ่านการตรวจสอบขอบเขตแล้ว
  }

  calculateLinearSpline = (points, targetX) => {
    const i = this.findInterval(points, targetX);
    const p0 = points[i];
    const p1 = points[i+1];
    const result = p0.y + ((p1.y - p0.y) / (p1.x - p0.x)) * (targetX - p0.x);
    return this.generateLinearSolution(p0, p1, targetX, result);
  }

  calculateQuadraticSpline = (points, targetX) => {
    const n = points.length;
    const nIntervals = n - 1;
    if (n < 3) throw new Error("Quadratic spline requires at least 3 points.");
    const nVars = 3 * nIntervals;
    let A = Array(nVars).fill(0).map(() => Array(nVars).fill(0));
    let B = Array(nVars).fill(0);
    let eqIndex = 0;
    for (let i = 0; i < nIntervals; i++) {
        const p_i = points[i], p_i1 = points[i+1];
        A[eqIndex][3*i] = p_i.x * p_i.x; A[eqIndex][3*i+1] = p_i.x; A[eqIndex][3*i+2] = 1; B[eqIndex] = p_i.y; eqIndex++;
        A[eqIndex][3*i] = p_i1.x * p_i1.x; A[eqIndex][3*i+1] = p_i1.x; A[eqIndex][3*i+2] = 1; B[eqIndex] = p_i1.y; eqIndex++;
    }
    for (let i = 1; i < nIntervals; i++) {
        const p_i = points[i];
        A[eqIndex][3*(i-1)] = 2 * p_i.x; A[eqIndex][3*(i-1)+1] = 1;
        A[eqIndex][3*i] = -2 * p_i.x; A[eqIndex][3*i+1] = -1; B[eqIndex] = 0; eqIndex++;
    }
    A[eqIndex][0] = 1; B[eqIndex] = 0;
    const coeffs = lusolve(A, B).flat();
    const i = this.findInterval(points, targetX);
    const a = coeffs[3*i], b = coeffs[3*i + 1], c = coeffs[3*i + 2];
    const result = (a * targetX * targetX) + (b * targetX) + c;
    return this.generateQuadraticSolution(points, coeffs, targetX, result);
  }

  calculateCubicSpline = (points, targetX) => {
      const n = points.length;
      if (n < 3) throw new Error("Cubic spline requires at least 3 points.");
      const h = Array(n - 1);
      for (let i = 0; i < n - 1; i++) h[i] = points[i + 1].x - points[i].x;
      const A = Array(n).fill(0).map(() => Array(n).fill(0));
      const B = Array(n).fill(0);
      A[0][0] = 1;
      A[n - 1][n - 1] = 1;
      for (let i = 1; i < n - 1; i++) {
          A[i][i - 1] = h[i - 1];
          A[i][i] = 2 * (h[i - 1] + h[i]);
          A[i][i + 1] = h[i];
          B[i] = 3 * ((points[i + 1].y - points[i].y) / h[i] - (points[i].y - points[i - 1].y) / h[i - 1]);
      }
      const c_coeffs = lusolve(A, B).flat();
      const a_coeffs = Array(n-1), b_coeffs = Array(n-1), d_coeffs = Array(n-1);
      for (let i = 0; i < n - 1; i++) {
          a_coeffs[i] = points[i].y;
          b_coeffs[i] = (points[i + 1].y - a_coeffs[i]) / h[i] - h[i] * (2 * c_coeffs[i] + c_coeffs[i + 1]) / 3;
          d_coeffs[i] = (c_coeffs[i + 1] - c_coeffs[i]) / (3 * h[i]);
      }
      const i = this.findInterval(points, targetX);
      const dx = targetX - points[i].x;
      const result = a_coeffs[i] + b_coeffs[i] * dx + c_coeffs[i] * dx * dx + d_coeffs[i] * dx * dx * dx;
      return this.generateCubicSolution(points, {a:a_coeffs, b:b_coeffs, c:c_coeffs, d:d_coeffs}, targetX, result);
  }

  //? Solution Step Generators
  generateLinearSolution = (p0, p1, targetX, result) => {
      let steps = [];
      steps.push(`\\( \\large{\\textbf{1. Find Interval}} \\)`);
      steps.push(`\\( \\text{Target X = ${targetX} is in the interval } [${p0.x}, ${p1.x}] \\)`);
      steps.push(`\\( \\large{\\textbf{2. Linear Interpolation Formula}} \\)`);
      steps.push(`\\( P_1(x) = y_0 + \\frac{y_1 - y_0}{x_1 - x_0}(x - x_0) \\)`);
      steps.push(`\\( P_1(${targetX}) = ${p0.y} + \\frac{${p1.y} - ${p0.y}}{${p1.x} - ${p0.x}}(${targetX} - ${p0.x}) \\)`);
      steps.push(`\\( \\therefore f(${targetX}) \\approx ${format(result, { precision: 14 })} \\)`);
      return steps;
  };

  generateQuadraticSolution = (points, coeffs, targetX, result) => {
      let steps = [];
      const nIntervals = points.length - 1;
      steps.push(`\\( \\large{\\textbf{1. Spline Equations}} \\)`);
      steps.push(`\\( \\text{Solving for coefficients yields the splines } P_i(x) = a_ix^2 + b_ix + c_i \\)`);
      for(let i=0; i < nIntervals; i++){
          const a = format(coeffs[3*i], {notation: 'fixed', precision: 4});
          const b = format(coeffs[3*i+1], {notation: 'fixed', precision: 4});
          const c = format(coeffs[3*i+2], {notation: 'fixed', precision: 4});
          steps.push(`\\( P_{${i+1}}(x) = (${a})x^2 + (${b})x + (${c}), \\quad \\text{for } x \\in [${points[i].x}, ${points[i+1].x}] \\)`);
      }
      steps.push(`\\( \\large{\\textbf{2. Interpolate at }} x = ${targetX} \\)`);
      steps.push(`\\( \\therefore f(${targetX}) \\approx ${format(result, { precision: 14 })} \\)`);
      return steps;
  };
  
  generateCubicSolution = (points, coeffs, targetX, result) => {
      let steps = [];
      const nIntervals = points.length - 1;
      const {a, b, c, d} = coeffs;
      steps.push(`\\( \\large{\\textbf{1. Spline Equations}} \\)`);
      steps.push(`\\( \\text{Solving for coefficients yields the splines } S_i(x) = a_i + b_i(x-x_i) + c_i(x-x_i)^2 + d_i(x-x_i)^3 \\)`);
      for(let i=0; i < nIntervals; i++){
          const ai = format(a[i], {notation: 'fixed', precision: 4});
          const bi = format(b[i], {notation: 'fixed', precision: 4});
          const ci = format(c[i], {notation: 'fixed', precision: 4});
          const di = format(d[i], {notation: 'fixed', precision: 4});
          steps.push(`\\( S_{${i}}(x) = ${ai} + ${bi}(x-${points[i].x}) + ${ci}(x-${points[i].x})^2 + ${di}(x-${points[i].x})^3, \\quad x \\in [${points[i].x}, ${points[i+1].x}] \\)`);
      }
      steps.push(`\\( \\large{\\textbf{2. Interpolate at }} x = ${targetX} \\)`);
      steps.push(`\\( \\therefore f(${targetX}) \\approx ${format(result, { precision: 14 })} \\)`);
      return steps;
  }

  //? Override Render Method
  renderForm = () => {
    const { points, targetX, splineType } = this.state;
    return (
      <Form>
        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <Form.Group>
                <Form.Label>Select Spline Type:</Form.Label>
                <Form.Select value={splineType} onChange={this.handleSplineTypeChange}>
                    <option value="linear">Linear Spline</option>
                    <option value="quadratic">Quadratic Spline</option>
                    <option value="cubic">Cubic Spline</option>
                </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <Form.Label>Number of Data Points:</Form.Label>
            <InputGroup>
              <Button variant="outline-danger" onClick={() => this.removePoint(points.length - 1)} disabled={points.length <= 2}>-</Button>
              <Form.Control type="text" readOnly value={points.length} className="text-center" />
              <Button variant="outline-success" onClick={this.addPoint} disabled={points.length >= 10}>+</Button>
            </InputGroup>
          </Col>
        </Row>
        <div className="container mb-2 mx-3">Input x and y</div>
        {points.map((point, index) => (
          <Row key={index} className="justify-content-center align-items-center mb-2 mx-3">
            <Col>
              <Form.Control type="number" placeholder={`x${index}`} value={point.x} onChange={e => this.handlePointChange(e, index, 'x')} />
            </Col>
            <Col>
              <Form.Control type="number" placeholder={`y${index}`} value={point.y} onChange={e => this.handlePointChange(e, index, 'y')} />
            </Col>
            <Col xs={1}>
            </Col>
          </Row>
        ))}
        <Row className="justify-content-center mt-4">
            <Col md={6}>
                <Form.Group>
                    <Form.Label>Enter X to Interpolate:</Form.Label>
                    <Form.Control type="number" value={targetX} onChange={e => this.setState({targetX: e.target.value})}/>
                </Form.Group>
            </Col>
        </Row>
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="mx-2 w-25">Calculate</Button>
          <Button variant="success" onClick={this.fillForm} className="mx-2">Fill Form</Button>
          <Button variant="danger" onClick={this.clearForm} className="mx-2">Clear Form</Button>
        </div>
      </Form>
    );
  };
}

export default SplineInterpolation;

