import React from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";

class BaseLinearAlgebra extends React.Component {
  //@ Constructor: ตั้งค่า State ส่วนกลางสำหรับโจทย์เมทริกซ์
  constructor(props) {
    super(props);
    this.state = {
      matrixSize: 2, //* ขนาดเริ่มต้นของเมทริกซ์ (2x2)
      matrixA: [['', ''], ['', '']], //* โครงสร้างข้อมูลสำหรับเก็บค่าใน Matrix A
      matrixB: ['', ''], //* โครงสร้างข้อมูลสำหรับเก็บค่าใน Vector B
      solution: null, //* ที่เก็บผลลัพธ์ (เริ่มต้นเป็น null เพื่อซ่อนกล่อง Solution)
      title: 'Linear Algebra Solver', //* ชื่อหัวข้อเริ่มต้น
    };
  }
  //? กลุ่มเมธอด handle... (Event Handlers)
  //@ 1. Method: จัดการเมื่อมีการเปลี่ยนแปลงขนาดของเมทริกซ์
  handleSizeChange = (event) => {
    const size = parseInt(event.target.value); //* รับค่า Size ใหม่จาก Input แล้วแปลงเป็นตัวเลข
    if (size > 0 && size <= 10) {
      //* สร้าง "พิมพ์เขียว" ของ Matrix A ขึ้นมาใหม่
      const newMatrixA = Array(size).fill(0).map(() => Array(size).fill(''));
      //* สร้าง "พิมพ์เขียว" ของ Vector B ขึ้นมาใหม่
      const newMatrixB = Array(size).fill('');
      this.setState({ //* สั่งให้ React อัปเดต State ทั้งหมดในครั้งเดียว
        matrixSize: size, 
        matrixA: newMatrixA, 
        matrixB: newMatrixB, 
        solution: null }); //* Reset Solution ก่อนหน้า
    }
  }

  //? Method for Fill Data & Clear Data in Field
  //@ 1. Method: สำหรับปุ่ม Fill Form
  fillForm = () => {
    const matrixSize = this.state.matrixSize;
    //* สร้างเมทริกซ์ A 2 มิติขึ้นมาใหม่ มีค่าตั้งแต่ 1 - 100 
    const newMatrixA = Array(matrixSize).fill(0).map(() => 
      Array(matrixSize).fill(0).map(() => Math.floor(Math.random() * 100) + 1)
  );  
    //* สร้างเมทริกซ์ B 1 มิติขึ้นมาใหม่ มีค่าตั้งแต่ 1 - 100 
    const newMatrixB = Array(matrixSize).fill(0).map(() => Math.floor(Math.random() * 100) + 1);
    this.setState({ matrixA: newMatrixA, matrixB: newMatrixB });
  }

  //@ 2. Method: สำหรับปุ่ม Clear Form
  clearForm = () => {
    const matrixSize = this.state.matrixSize;
    //* สร้าง "พิมพ์เขียว" ของ Matrix A ขึ้นมาใหม่
    const newMatrixA = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(''));
    //* สร้าง "พิมพ์เขียว" ของ Vector B ขึ้นมาใหม่
    const newMatrixB = Array(matrixSize).fill('');
    this.setState({ 
      matrixA: newMatrixA,
      matrixB: newMatrixB,
      solution: null //* Reset Solution ก่อนหน้า 
    });
  }

  //? Methods for Calculate and Solution
  //@ 1. Method: ใส่สูตรการคำนวณของตัวเอง
  calculateMethod = () => { alert("calculateMethod() must be implemented."); };
  //@ 2. Method: สร้างขั้นตอนการแสดงผลลัพธ์ในรูปแบบของตัวเอง
  generateSolutionSteps = () => {
    console.warn("generateSolutionSteps() must be overridden in the subclass.");
    return [];
  };
  //@ 3. Method: ฟังก์ชันสำหรับแปลง Matrix เป็น LaTeX
  matrixToLatex = (matrix) => {
    alert("matrixToLatex() must be implemented.")
  }
  //?📌 Method Render
  //@ 1. ชื่อของ Solution ที่ใช้ในการคำนวณ
  nameOfSolution = () => { return <h2 className="mb-3 text-center">{this.state.title}</h2>; };
  
  //@ 2. Form สำหรับรับข้อมูลจากผู้ใช้
  renderForm = () => {
    //* สร้าง Array ตามขนาดเพื่อใช้ map สร้าง input
    const sizeArray = Array.from(Array(this.state.matrixSize).keys());
    return (
      <Form>
        {/* ส่วนเลือกขนาดเมทริกซ์ */}
        <Row className="justify-content-center">
          <Col sm={8} md={6} lg={4}>
            <Form.Group as={Row}>
              <Form.Label column sm={7}>Matrix Size (N x N):</Form.Label>
              <Col sm={5}>
                <Form.Control 
                type="number" 
                value={this.state.matrixSize} 
                onChange={this.handleSizeChange} 
                min="1" max="10"/>
              </Col>
            </Form.Group>
          </Col>
        </Row>
        {/* ส่วนแสดงเมทริกซ์ (แก้ไข Layout) */}
        <div className="d-flex justify-content-center mt-4">
            {/* Matrix A Column */}
            <div className="d-flex flex-column align-items-center me-3">
                <div className="mb-2">[A]</div>
                {sizeArray.map(row => (
                  <Row key={row} className="mb-2">
                        {sizeArray.map(col => (
                            <Col key={col} className="p-1">
                                <Form.Control 
                                style={{ width: '4rem',height: "4rem" }} 
                                type="number" 
                                value={this.state.matrixA[row][col]} 
                                onChange={e => this.setState({matrixA: 
                                    this.state.matrixA.map((m,i) => i == row ? 
                                    m.map((val,j) => j == col ? e.target.value: val): m)})} />
                            </Col>
                        ))} 
                    </Row>
                ))}
            </div>
            {/* Matrix X Column */}
            <div className="d-flex flex-column align-items-center me-3">
                <div className="mb-2">{`{x}`}</div>
                {sizeArray.map(row => (
                  <div 
                  key={row} 
                  className="mb-3 d-flex align-items-center justify-content-center" 
                  style={{ height: '4rem', width: '4rem' }}>
                        <MathJax inline>{`\\(x_{${row+1}}\\)`}</MathJax>
                    </div>
                ))}
            </div>
            <div className="me-5 d-flex align-items-center">=</div>
            {/* Matrix B Column */}
            <div className="d-flex flex-column align-items-center">
                <div className="mb-2">{`{B}`}</div>
                {sizeArray.map(row => (
                  <Row key={row} className="mb-2">
                        <Col className="p-1">
                            <Form.Control 
                            style={{ width: '4rem', height: '4rem'}} 
                            type="number" 
                            value={this.state.matrixB[row]} 
                            onChange={(e) => this.setState({ matrixB:
                                  this.state.matrixB.map((val, i) =>
                                  i === row ? e.target.value : val)})} />
                        </Col>
                    </Row>
                ))}
            </div>
        </div>
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="mx-2 w-25">Calculate</Button>
          <Button variant="success" onClick={this.fillForm} className="mx-2">Fill Form</Button>
          <Button variant="danger" onClick={this.clearForm} className="mx-2">Clear Form</Button>
        </div>
      </Form>
    );
  };

  //@ 3. Method renderSolution ทำการ render ขั้นตอนการแสดงผลลัพธ์
  renderSolution = () => {
    return (
      <div className="d-flex justify-content-center">
        {/* div นี้จะทำให้เกิด scrollbar แนวนอนเมื่อเนื้อหาล้นในจอขนาดเล็ก */}
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

  //@ 4. Method หลักสำหรับ Render UI ทั้งหมด
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

export default BaseLinearAlgebra;

