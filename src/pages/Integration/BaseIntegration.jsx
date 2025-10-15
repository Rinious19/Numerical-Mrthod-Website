import React from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { evaluate } from "mathjs";
import { fetchRandomPreset } from "../../PresetManager";

class BaseIntegration extends React.Component {
  //@ Constructor: ตั้งค่า State ส่วนกลางสำหรับโจทย์ Integration
  constructor(props) {
    super(props);
    this.state = {
      fx: '',          //* ฟังก์ชันที่จะอินทิเกรต
      lowerBound: '',  //* ขอบเขตล่าง (a)
      upperBound: '',  //* ขอบเขตบน (b)
      segments: '',    //* จำนวนช่วง (n) สำหรับ Composite Rules
      solution: null,
      title: 'Integration Solver',
      collectionName: 'integrationpresets',
    };
  }

  //? Helper Function
  //@ ฟังก์ชันสำหรับ evaluate f(x)
  f = (x) => {
    try {
      return evaluate(this.state.fx, { x });
    } catch (error) {
      console.error("Error evaluating function:", error);
      return NaN;
    }
  };

  //? Event Handlers
  handleInputChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  //? Control Buttons Logic
  //@ Method: สำหรับปุ่ม Fill Form
  fillForm = async () => {
    const presetData = await fetchRandomPreset(this.state.collectionName); //* เรียกใช้ฟังก์ชันสุ่ม
    if (presetData) {
      this.setState({fx: presetData.fx, lowerBound: presetData.lowerBound, 
                    upperBound: presetData.upperBound, segments: presetData.segments });
      //* แสดงชื่อ Preset ที่สุ่มได้
      console.error(`เติมข้อมูลสุ่มจาก Preset '${presetData.id}' สำเร็จ!`);
    }
  }

  //@ Method: สำหรับปุ่ม Clear Form
  clearForm = () => {
    this.setState({ fx: '', lowerBound: '', upperBound: '', segments: '', solution: null, });
  }

  //? Methods ที่คลาสลูก "ต้อง" เขียนทับ (Override)
  calculateMethod = () => { alert("calculateMethod() must be implemented."); };
  generateSolutionSteps = () => {
    console.warn("generateSolutionSteps() must be overridden.");
    return [];
  };
  nameOfSolution = () => { return <h2 className="mb-3 text-center">{this.state.title}</h2>; };
  
  //? Render Methods
  //@ Form สำหรับรับข้อมูลจากผู้ใช้
  renderForm = () => {
    const { fx, lowerBound, upperBound, segments } = this.state;
    // สร้างเงื่อนไขเพื่อ disable ปุ่ม Calculate
    const isCalculateDisabled = !fx || lowerBound === '' || upperBound === '';
    return (
      <Form>
        {/* ส่วนกรอกสมการ f(x) */}
        <Row className="align-items-end mb-3">
          <Col md={7}>
            <Form.Group>
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
            <div className="p-3 fs-5 justify-content-start border rounded bg-light h-100 d-flex align-items-center">
              <MathJax inline>{"\\(\\int_{a}^{b} f(x) \\, dx \\, \\approx \\, \\)"}</MathJax>
              {fx ? (
                <MathJax inline>{`\\(\\int_{${lowerBound}}^{${upperBound}}(${fx}) \\, dx\\)`}</MathJax>
              ) : (
                <span className="opacity-50 ms-2">...</span>
              )}
            </div>
          </Col>
        </Row>
        {/* ส่วนกรอกขอบเขตและจำนวนช่วง */}
        <Row>
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
          <Col md={4}>
            <Form.Group>
              <Form.Label>Number of Segments (n):</Form.Label>
              <Form.Control type="number" name="segments" value={segments} onChange={this.handleInputChange} />
            </Form.Group>
          </Col>
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

  //@ Method สำหรับ Render ผลลัพธ์
  renderSolution = () => {
    return (
      <div className="d-flex justify-content-center">
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          {this.state.solution.map((step, index) => (
            <div key={index} className="mb-3">
              <MathJax>{step}</MathJax>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //@ Method หลักสำหรับ Render UI ทั้งหมด
  render() {
    return (
      <Card className="container p-3 mt-4 shadow-sm">
        {this.nameOfSolution()}
        {this.renderForm()}
        {this.state.solution && (
          <div className="mt-4">
            <h4 className="mb-3">Solution</h4>
            <Card className="p-3 bg-light">
              {this.renderSolution()}
            </Card>
          </div>
        )}
      </Card>
    );
  }
}

export default BaseIntegration;
