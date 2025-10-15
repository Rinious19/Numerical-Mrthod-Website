import React from "react";
import { Card, Form, Button, Row, Col, InputGroup } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";

class BaseInterpolation extends React.Component {
  //@ Constructor: ตั้งค่า State ส่วนกลางสำหรับโจทย์ Interpolation
  constructor(props) {
    super(props);
    this.state = {
      points: [ { x: '', y: '' }, { x: '', y: '' } ], //* เริ่มต้นด้วยจุดข้อมูล 2 จุด
      numPoints: 2, //* จำนวนจุดข้อมูลเริ่มต้น
      targetX: '',  //* ค่า x ที่ต้องการประมาณค่า y
      solution: null,
      title: 'Interpolation Solver',
    };
  }

  //? กลุ่มเมธอดจัดการฟอร์ม (Event Handlers)
  //@ Method: จัดการเมื่อมีการเปลี่ยนแปลงค่าในจุดข้อมูล (x, y)
  handlePointChange = (event, index, key) => {
    //* สร้างสำเนาของ points array เพื่อไม่แก้ไข state โดยตรง
    const newPoints = [...this.state.points];
    newPoints[index][key] = event.target.value;
    this.setState({ points: newPoints });
  }

  //@ Method: สำหรับปุ่ม "เพิ่ม" จุดข้อมูล
  addPoint = () => {
    //* เพิ่มจุดข้อมูลใหม่ที่เป็นค่าว่างเข้าไปใน array
    const newPoints = [...this.state.points, { x: '', y: '' }];
    this.setState({ points: newPoints, numPoints: this.state.numPoints + 1 });
  }

  //@ Method: สำหรับปุ่ม "ลบ" จุดข้อมูล
  removePoint = (indexToRemove) => {
    //* ไม่อนุญาตให้ลบจนเหลือน้อยกว่า 2 จุด
    if (this.state.numPoints <= 2) {
      alert("At least two points are required.");
      return;
    }
    //* ใช้ filter เพื่อสร้าง array ใหม่ที่ไม่มีจุดข้อมูล ณ index ที่ต้องการลบ
    const newPoints = this.state.points.filter((_, index) => index !== indexToRemove);
    this.setState({ points: newPoints, numPoints: this.state.numPoints - 1 });
  }

  //? กลุ่มเมธอดสำหรับปุ่มควบคุม
  //@ Method: สำหรับปุ่ม Fill Form (สุ่มค่าแบบมีแนวโน้ม)
  fillForm = () => {
    const { numPoints } = this.state;
    //* สุ่มความชัน (m) และจุดตัดแกน Y (c) เพื่อสร้างสมการเส้นตรง y = mx + c
    const m = (Math.random() * 10) - 5; //* สุ่ม m ระหว่าง -5 ถึง 5
    const c = Math.random() * 20;       //* สุ่ม c ระหว่าง 0 ถึง 20
    let currentX = Math.floor(Math.random() * 5); //* สุ่มค่า x เริ่มต้น
    const newPoints = [];
    for (let i = 0; i < numPoints; i++) {
      //* คำนวณค่า y จากสมการเส้นตรง และเพิ่ม "noise" เล็กน้อยเพื่อให้ไม่เป็นเส้นตรงเป๊ะๆ
      const y = m * currentX + c + (Math.random() - 0.5);
      newPoints.push({ 
        x: currentX, 
        y: parseFloat(y.toFixed(4)) //* ปัดทศนิยมให้ดูสวยงาม
      });
      currentX += Math.floor(Math.random() * 3) + 1; //* เพิ่มค่า x ในแต่ละรอบ 1-3
    }
    this.setState({ points: newPoints, targetX: Math.floor(Math.random()*100) });
  }

  //@ Method: สำหรับปุ่ม Clear Form
  clearForm = () => {
    //* Reset state กลับไปเป็นค่าเริ่มต้น (มี 2 จุดว่างๆ)
    const newPoints = [ { x: '', y: '' }, { x: '', y: '' } ];
    this.setState({ points: newPoints, numPoints: 2, targetX: '', solution: null });
  }

  //? Methods ที่คลาสลูก "ต้อง" เขียนทับ (Override)
  calculateMethod = () => { alert("calculateMethod() must be implemented."); };
  generateSolutionSteps = () => {
    console.warn("generateSolutionSteps() must be overridden.");
    return [];
  };
  nameOfSolution = () => { return <h2 className="mb-3 text-center">{this.state.title}</h2>; };
  
  //? Method Render
  //@ Form สำหรับรับข้อมูลจากผู้ใช้
  renderForm = () => {
    const { points, targetX } = this.state;
    return (
      <Form>
        {/* ส่วนจัดการจุดข้อมูล */}
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
        <div className="container mx-3 mb-2">Input x and y</div>
        {points.map((point, index) => (
          <Row key={index} className="justify-content-center align-items-center mb-2 mx-3">
            <Col>
              <Form.Control onChange={e => this.handlePointChange(e, index, 'x')} value={point.x} type="number" placeholder={`x${index}`} />
            </Col>
            <Col>
              <Form.Control onChange={e => this.handlePointChange(e, index, 'y')} value={point.y} type="number" placeholder={`y${index}`} />
            </Col>
          </Row>
        ))}
        {/* ส่วนกรอก Target X */}
        <Row className="justify-content-center mt-4">
            <Col md={6}>
                <Form.Group>
                    <Form.Label>Enter X to Interpolate:</Form.Label>
                    <Form.Control onChange={(e) => this.setState({targetX:e.target.value})} type="number" value={targetX} />
                </Form.Group>
            </Col>
        </Row>
        {/* ส่วนของปุ่มควบคุม */}
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="mx-2 w-25">Calculate</Button>
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

export default BaseInterpolation;
