import React from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { fetchRandomPreset } from "../../PresetManager";
import { MathJax } from "better-react-mathjax";
import { evaluate } from "mathjs";

class BaseDifferentiation extends React.Component {
  //@ Constructor: ตั้งค่า State ส่วนกลางสำหรับโจทย์ Differentiation
  constructor(props) {
    super(props);
    this.state = {
      fx: '',          //* ฟังก์ชัน
      x: '',           //* จุดที่ต้องการหาอนุพันธ์
      h: '',           //* ขนาดของช่วง
      derivativeOrder: 1, //* อันดับอนุพันธ์ (1st, 2nd, 3rd, 4th)
      errorOrder: 1,     //* อันดับของ Error (h, h^2, h^4)
      diffType: 'forward', //* ประเภทของ Method ('forward', 'backward', 'central') - คลาสลูกจะ override ค่านี้
      solution: null,
      collectionName: 'differentiationpresets',
      title: 'Differentiation Solver',
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
  //@ Method: จัดการ Input/Dropdown ทั้งหมดในฟอร์ม
  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  //? Control Buttons Logic
  //@ Method: สำหรับปุ่ม Fill Form
  fillForm = async () => {
    const presetData = await fetchRandomPreset(this.state.collectionName); //* เรียกใช้ฟังก์ชันสุ่ม
    if (presetData) {
      this.setState({fx: presetData.fx, x: presetData.x, h: presetData.h});
      //* แสดงชื่อ Preset ที่สุ่มได้
      console.error(`เติมข้อมูลสุ่มจาก Preset '${presetData.id}' สำเร็จ!`);
    }
  }

  //@ Method: สำหรับปุ่ม Clear Form
  clearForm = () => ( this.setState({fx: '', x: '', h: '', solution: null,}) )

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
    const { fx, x, h, derivativeOrder, errorOrder, diffType } = this.state;
    // สร้างเงื่อนไขเพื่อ disable ปุ่ม Calculate
    const isCalculateDisabled = !fx || x === '' || h === '';
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
              <MathJax inline>{"\\(f(x) \\quad = \\quad \\)"}</MathJax>
              {fx ? (
                <MathJax inline>{`\\(${fx}\\)`}</MathJax>
              ) : (
                <span className="opacity-50 ms-2">...</span>
              )}
            </div>
          </Col>
        </Row>
        
        {/* ส่วนกรอก x, h, และ Dropdowns */}
        <Row>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Point (x):</Form.Label>
              <Form.Control type="number" name="x" value={x} onChange={this.handleInputChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Step Size (h):</Form.Label>
              <Form.Control type="number" name="h" value={h} onChange={this.handleInputChange} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Derivative Order:</Form.Label>
              <Form.Select name="derivativeOrder" value={derivativeOrder} onChange={this.handleInputChange}>
                <option value="1">1st Derivative</option>
                <option value="2">2nd Derivative</option>
                <option value="3">3rd Derivative</option>
                <option value="4">4th Derivative</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Error Order:</Form.Label>
              <Form.Select name="errorOrder" value={errorOrder} onChange={this.handleInputChange}>
                {(diffType === 'forward' || diffType === 'backward') && 
                  <>
                    <option value="1">O(h)</option>
                    <option value="2">O(h²)</option>
                  </>
                }
                {diffType === 'central' && 
                  <>
                    <option value="2">O(h²)</option>
                    <option value="4">O(h⁴)</option>
                  </>
                }
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* ส่วนของปุ่มควบคุม */}
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="w-25 mx-2" disabled={isCalculateDisabled}>Calculate</Button>
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

export default BaseDifferentiation;
