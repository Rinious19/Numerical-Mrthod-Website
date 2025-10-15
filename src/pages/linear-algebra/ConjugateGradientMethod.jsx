import JacobiIterationMethod from './JacobiIterationMethod';
import { multiply, subtract, dot, add } from 'mathjs';
import React from 'react'; //* Import React
import { Table } from 'react-bootstrap'; //* Import Table
import { MathJax } from "better-react-mathjax"; //* Import MathJax
import { format } from "mathjs"; //* Import format

class ConjugateGradientMethod extends JacobiIterationMethod {
  //@ Constructor
  constructor(props) {
    super(props);
    //* Override ค่า title ใน State
    this.state.title = "Conjugate Gradient Method";
  }

  //? Override Calculation Method
  //@ 3. Override เฉพาะ Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB, initialX, matrixSize, tol, maxIterations } = this.state;
    //* แปลง Input ทั้งหมดเป็นตัวเลข
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    let x = initialX.map(val => parseFloat(val));
    //* ตรวจสอบ Input
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all matrix fields.");
        return;
    }
    if (x.some(isNaN)){
        alert("Please enter valid numbers in the initial guess vector.");
        return;
    }
    //* ตรวจสอบว่าเมทริกซ์ A เป็นเมทริกซ์สมมาตรหรือไม่
    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < i; j++) {
            if (numA[i][j] !== numA[j][i]) {
                alert("Matrix A is not symmetric. Conjugate Gradient Method requires a symmetric positive-definite matrix.");
                this.setState({ solution: null });
                return;
            }
        }
    }
    const iterationsData = [];
    let iter = 0;
    //* Conjugate Gradient Initialization
    let r = subtract(numB, multiply(numA, x)); //* r = b - Ax (Residual)
    let d = [...r]; //* d = r (Search Direction)
    let rDotR = dot(r, r);
    let error = Math.sqrt(rDotR); //* Initial error is the norm of the initial residual
    //* เพิ่ม Initial Guess เป็น Iteration 0
    iterationsData.push({
      iter: 0,
      x: x,
      error: error
    });
    //* Iteration Loop
    while (error > tol && iter < maxIterations) {
      const Ad = multiply(numA, d);
      const alphaDenominator = dot(d, Ad);
      if (Math.abs(alphaDenominator) < 1e-12) {
          alert("Calculation failed: dot(d, Ad) is close to zero, cannot compute alpha.");
          this.setState({ solution: null });
          return;
      }
      const alpha = rDotR / alphaDenominator;
      const xNew = add(x, multiply(alpha, d));
      const rNew = subtract(r, multiply(alpha, Ad));
      const rNewDotRNew = dot(rNew, rNew);
      //? อัปเดต Error ด้วย Norm ของ Residual ใหม่
      error = Math.sqrt(rNewDotRNew);
      const beta = rNewDotRNew / rDotR;
      const dNew = add(rNew, multiply(beta, d));
      iter++;
      //? บันทึก error ที่เป็นค่าเดียว
      iterationsData.push({ iter, x: xNew, error: error });
      //* อัปเดตค่าสำหรับรอบถัดไป
      x = [...xNew];
      r = [...rNew];
      d = [...dNew];
      rDotR = rNewDotRNew;
    }
    this.setState({ solution: iterationsData });
  };

  //? Override Solution Rendering Method
  //@ 4. Override renderSolution เพื่อแสดง error ค่าเดียว
  renderSolution = () => {
    const precision = 6; //* จำนวนทศนิยมสำหรับ Error
    return (
      <Table bordered hover responsive>
          <thead className="text-center table-light">
              <tr>
                  <th>iter</th>
                  <th>x_k</th>
                  <th>error (norm of residual)</th>
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
                      <td className="text-center">
                          <MathJax inline>{`\\(${isFinite(iterData.error) ? iterData.error.toFixed(precision) : '\\infty'}\\)`}</MathJax>
                      </td>
                  </tr>
              ))}
          </tbody>
      </Table>
    );
  };
}

export default ConjugateGradientMethod;

