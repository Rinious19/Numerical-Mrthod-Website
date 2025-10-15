import React from "react";
import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { Form, Button, Row, Col, Table } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class JacobiIterationMethod extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Jacobi Iteration Method";
    //* เพิ่ม State สำหรับ Iterative Methods โดยเฉพาะ
    this.state.initialX = ['', '']; //* ค่าเดาเริ่มต้นสำหรับเวกเตอร์ x
    this.state.tol = 0.0001;
    this.state.maxIterations = 100;
  }

  //? Override Helper Functions from Base Class
  //@ Override: จัดการเมื่อมีการเปลี่ยนแปลงขนาดของเมทริกซ์
  handleSizeChange = (event) => {
    const size = parseInt(event.target.value);
    if (size > 0 && size <= 10) {
      const newMatrixA = Array(size).fill(0).map(() => Array(size).fill(''));
      const newMatrixB = Array(size).fill('');
      const newInitialX = Array(size).fill(''); //* สร้าง initialX ใหม่ด้วย
      this.setState({ 
        matrixSize: size, 
        matrixA: newMatrixA, 
        matrixB: newMatrixB, 
        initialX: newInitialX,
        solution: null 
      });
    }
  }

  //@ Method: จัดการเมื่อมีการเปลี่ยนแปลงค่าในเวกเตอร์ X (Initial Guess)
  handleInitialXChange = (event, row) => {
    const newInitialX = [...this.state.initialX];
    newInitialX[row] = event.target.value;
    this.setState({ initialX: newInitialX });
  }
  
  //? Method for Fill Data & Clear Data in Field
  //@ Override: สำหรับปุ่ม Fill Form (อัปเดตแล้ว)
  fillForm = () => {
    const { matrixSize } = this.state;
    //* สุ่มค่าสำหรับ Matrix A (1 ถึง 100)
    const newMatrixA = Array(matrixSize).fill(0).map(() => 
      Array(matrixSize).fill(0).map(() => Math.floor(Math.random() * 100) + 1)
    );
    //* สุ่มค่าสำหรับ Matrix B (1 ถึง 100)
    const newMatrixB = Array(matrixSize).fill(0).map(() => Math.floor(Math.random() * 100) + 1);
    //* สุ่มค่าสำหรับ Initial Guess {x}⁰ (-10 ถึง 0)
    const newInitialX = Array(matrixSize).fill(0).map(() => Math.floor(Math.random() * 11) - 10);
    this.setState({ 
        matrixA: newMatrixA, 
        matrixB: newMatrixB, 
        initialX: newInitialX 
    });
  }

  //@ Override: สำหรับปุ่ม Clear Form
  clearForm = () => {
    const { matrixSize } = this.state;
    const newMatrixA = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(''));
    const newMatrixB = Array(matrixSize).fill('');
    const newInitialX = Array(matrixSize).fill('');
    this.setState({ 
      matrixA: newMatrixA, 
      matrixB: newMatrixB, 
      initialX: newInitialX,
      tol: 0.0001,
      solution: null 
    });
  }

  //? Override Calculation and Solution Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB, initialX, matrixSize, tol, maxIterations } = this.state;
    //* แปลง Input ทั้งหมดเป็นตัวเลข
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    const xOld = initialX.map(val => parseFloat(val));
    //* ตรวจสอบ Input
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all matrix fields.");
        return;
    }
     if (xOld.some(isNaN)){
        alert("Please enter valid numbers in the initial guess vector.");
        return;
    }
    let iter = 0;
    let error = Infinity;
    const iterationsData = [];
    // เพิ่ม Initial Guess เป็น Iteration 0
    iterationsData.push({
      iter: 0,
      x: xOld,
      error: xOld.map(() => Infinity)
    });
    let xCurrent = [...xOld];
    while (error > tol && iter < maxIterations) {
      const xNew = [];
      for (let i = 0; i < matrixSize; i++) {
        let sum = 0;
        for (let j = 0; j < matrixSize; j++) {
          if (i !== j) {
            //? Logic ของ Jacobi: ใช้ค่า x จากรอบที่แล้ว (xCurrent) เสมอ
            sum += numA[i][j] * xCurrent[j];
          }
        }
        if (Math.abs(numA[i][i]) < 1e-9) {
          alert(`Diagonal element at [${i+1},${i+1}] is zero. Method fails.`);
          this.setState({ solution: null });
          return;
        }
        xNew[i] = (numB[i] - sum) / numA[i][i];
      }
      const errorArray = xNew.map((val, i) => {
        if (Math.abs(val) < 1e-9) return Infinity;
        return Math.abs((val - xCurrent[i]) / val) * 100;
      });
      error = Math.max(...errorArray.filter(e => isFinite(e)));
      if (!isFinite(error)) error = Infinity;
      iter++;
      iterationsData.push({ iter, x: xNew, error: errorArray });
      xCurrent = [...xNew]; 
    }
    this.setState({ solution: iterationsData });
  };

  //@ Override: Form สำหรับรับข้อมูล
  renderForm = () => {
    const { matrixSize, matrixA, matrixB, initialX, tol } = this.state;
    const sizeArray = Array.from(Array(matrixSize).keys());
    const isCalculateDisabled = 
      matrixA.some(row => row.some(val => val === '')) ||
      matrixB.some(val => val === '') ||
      initialX.some(val => val === '') ||
      tol === '';
    return (
      <Form>
        <Row className="justify-content-center">
          <Col sm={8} md={6} lg={4}>
            <Form.Group as={Row} className="align-items-center">
              <Form.Label column sm={7}>Matrix Size (N x N):</Form.Label>
              <Col sm={5}>
                <Form.Control type="number" value={matrixSize} onChange={this.handleSizeChange} min="1" max="10"/>
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
                                onChange={e => this.handleMatrixAChange(e, row, col)} />
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
                            onChange={e => this.handleMatrixBChange(e, row)} />
                        </Col>
                    </Row>
                ))}
            </div>
        </div>
        <Row className="justify-content-center mt-4">
            <Col xs={12} md={6} className="d-flex flex-column align-items-center mb-3">
                <div className="mb-2">{`Initial Guess {x}⁰`}</div>
                <Row>
                    {sizeArray.map(i => (
                        <Col key={i} className="p-1">
                            <Form.Control className="no-spinners" style={{ width: '80px', textAlign: 'center' }} type="number" value={initialX[i]} onChange={e => this.handleInitialXChange(e, i)} placeholder={`x${i+1}`} />
                        </Col>
                    ))}
                </Row>
            </Col>
            <Col xs={12} md={4}>
                <Form.Group>
                    <Form.Label>Error Tolerance (%)</Form.Label>
                    <Form.Control type="number" value={tol} step="0.0001" onChange={e => this.setState({ tol: e.target.value })} />
                </Form.Group>
            </Col>
        </Row>
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="mx-2 w-25" disabled={isCalculateDisabled}>Calculate</Button>
          <Button variant="success" onClick={this.fillForm} className="mx-2">Fill Form</Button>
          <Button variant="danger" onClick={this.clearForm} className="mx-2">Clear Form</Button>
        </div>
      </Form>
    );
  };

  //@ Override: สำหรับแสดงผลลัพธ์ (สร้างตาราง HTML)
  renderSolution = () => {
    const precision = 4;
    return (
      <Table bordered hover responsive>
          <thead className="text-center table-light">
              <tr>
                  <th>iter</th>
                  <th>x_k</th>
                  <th>error%</th>
              </tr>
          </thead>
          <tbody style={{ verticalAlign: 'middle' }}>
              {this.state.solution.map((iterData) => (
                  <tr key={iterData.iter}>
                      <td className="text-center">{iterData.iter}</td>
                      <td>
                          {iterData.x.map((val, index) => (
                              <div key={index}>
                                  <MathJax inline>{`\\(x_{${index + 1}} = ${format(val, { notation: 'fixed', precision: 6 })}\\)`}</MathJax>
                              </div>
                          ))}
                      </td>
                      <td>
                          {iterData.error.map((err, index) => (
                              <div key={index}>
                                  <MathJax inline>{`\\(e_{${index + 1}} = ${isFinite(err) ? err.toFixed(precision) : '\\infty'}\\)`}</MathJax>
                              </div>
                          ))}
                      </td>
                  </tr>
              ))}
          </tbody>
      </Table>
    );
  };
}

export default JacobiIterationMethod;

