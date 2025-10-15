import React from "react";
import BaseIntegration from "./BaseIntegration";
import { Form, Button, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class SingleTrapezoidalRule extends BaseIntegration {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Single Trapezoidal Rule";
  }

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { fx, lowerBound, upperBound } = this.state;
    //* แปลง Input เป็นตัวเลข
    const a = parseFloat(lowerBound);
    const b = parseFloat(upperBound);
    //* ตรวจสอบ Input
    if (isNaN(a) || isNaN(b) || !fx) {
        alert("Please enter a valid function and bounds.");
        return;
    }
    try {
      const h = b - a;
      const fa = this.f(a);
      const fb = this.f(b);
      //* คำนวณด้วยสูตร Single Trapezoidal Rule
      const integral = (h * (fa + fb)) / 2;
      //* เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
      const solutionSteps = this.generateSolutionSteps(a, b, fa, fb, integral);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert("An error occurred during calculation. Please check your function syntax.");
      this.setState({ solution: null });
      console.error(error);
    }
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (a, b, fa, fb, result) => {
    let steps = [];
    steps.push(`\\( \\large{\\textbf{1. Trapezoidal Rule Formula}} \\)`);
    steps.push(`\\( I \\approx \\frac{b-a}{2} [f(a) + f(b)] \\)`);
    steps.push(`\\( \\large{\\textbf{2. Substitute Values}} \\)`);
    steps.push(`\\( I \\approx \\frac{${b} - ${a}}{2} [f(${a}) + f(${b})] \\)`);
    steps.push(`\\( I \\approx \\frac{${b-a}}{2} [${format(fa, {precision: 6})} + ${format(fb, {precision: 6})}] \\)`);
    steps.push(`\\( \\large{\\textbf{3. Final Result}} \\)`);
    steps.push(`\\( I \\approx ${format(result, { precision: 14 })} \\)`);
    return steps;
  };
  
  //@ Override: Form สำหรับรับข้อมูล (ซ่อนช่อง Segments)
  renderForm = () => {
    const { fx, lowerBound, upperBound } = this.state;
    //* เงื่อนไขสำหรับ Single Rule จะไม่เช็ค segments
    const isCalculateDisabled = !fx || lowerBound === '' || upperBound === '';
    return (
      <Form>
        {/* ส่วนกรอกสมการ f(x) (เหมือน Base Class) */}
        <Row className="align-items-end mb-3">
          <Col md={7}>
            <Form.Group className="mb-2">
              <Form.Label>Function f(x)</Form.Label>
              <Form.Control 
                type="text" 
                name="fx"
                value={fx} 
                onChange={this.handleInputChange} 
              />
            </Form.Group>
          </Col>
          <Col md={5}>
            <div className="p-3 fs-5 border rounded text-center bg-light h-100 d-flex align-items-center">
              <MathJax inline>{"\\(\\int_{a}^{b} f(x) \\, dx \\, \\approx \\, \\)"}</MathJax>
              {fx ? (
                <MathJax inline>{`\\(\\int_{${lowerBound}}^{${upperBound}}(${fx}) \\, dx\\)`}</MathJax>
              ) : (
                <span className="opacity-50 ms-2">...</span>
              )}
            </div>
          </Col>
        </Row>
        {/* ส่วนกรอกขอบเขต (ซ่อนช่อง Segments) */}
        <Row className="justify-content-center">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Lower Bound (a):</Form.Label>
              <Form.Control type="number" name="lowerBound" value={lowerBound} onChange={this.handleInputChange} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Upper Bound (b):</Form.Label>
              <Form.Control type="number" name="upperBound" value={upperBound} onChange={this.handleInputChange} />
            </Form.Group>
          </Col>
          {/* ไม่ต้อง Render ช่อง Segments สำหรับ Single Rule */}
        </Row>
        {/* ส่วนของปุ่มควบคุม */}
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="mx-2 w-25" disabled={isCalculateDisabled}>Calculate</Button>
          <Button variant="success" onClick={this.fillForm} className="mx-2">Fill Form</Button>
          <Button variant="danger" onClick={this.clearForm} className="mx-2">Clear Form</Button>
        </div>
      </Form>
    );
  };
}

export default SingleTrapezoidalRule;
