import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { Form, Button, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { det, format } from "mathjs";

class CramersRule extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    this.state.title = "Cramer's Rule";
  }
  
  //@ ฟังก์ชันสำหรับแปลง Array 2D เป็น LaTeX Matrix
  matrixToLatex = (matrix) => {
    let latex = "\\begin{vmatrix}";
    latex += matrix.map(row => row.join(' & ')).join(' \\\\ ');
    latex += "\\end{vmatrix}";
    return latex;
  };

  //? Override Methods 
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB, matrixSize } = this.state;
    //* แปลงเมทริกซ์จาก String เป็น Number
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    //* ตรวจสอบว่ามี Input ที่ไม่ใช่ตัวเลขหรือไม่
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    try {
      const detA = det(numA);
      if (Math.abs(detA) < 1e-9) {
        alert("Determinant of Matrix A is zero. Cramer's Rule cannot be applied.");
        this.setState({ solution: null });
        return;
      }
      //* เรียกใช้ Method ใหม่เพื่อสร้างขั้นตอนการแสดงผล
      const solutionSteps = this.generateSolutionSteps(detA, numA, numB, matrixSize);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert("An error occurred during calculation. Please check your matrix values.");
      console.error(error);
    }
  };
  
  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (detA, numA, numB, matrixSize) => {
    let solutionSteps = [];
    let results = [];
    //* สร้างขั้นตอนการแสดงผล
    solutionSteps.push(`\\( \\text{From Cramer's Rule; } x_i = \\frac{det(A_i)}{det(A)} \\)`);
    solutionSteps.push(`\\( det(A) = ${this.matrixToLatex(numA)} = ${format(detA, { precision: 8 })} \\)`);
    for (let i = 0; i < matrixSize; i++) {
      //* สร้างเมทริกซ์ Ai
      const matrixAi = numA.map((row, rowIndex) => 
          row.map((val, colIndex) => colIndex === i ? numB[rowIndex] : val)
      );
      const detAi = det(matrixAi);
      const xi = detAi / detA;
      results.push(xi);
      solutionSteps.push(`\\( x_{${i + 1}} = \\frac{det(A_{${i + 1}})}{det(A)} = 
        \\frac{${this.matrixToLatex(matrixAi)}}{${format(detA, { precision: 8 })}} = 
        \\frac{${format(detAi, { precision: 8 })}}{${format(detA, { precision: 8 })}} = 
        ${format(xi, { precision: 8 })} \\)`);
    }
    const resultVars = results.map((val, i) => `x_{${i+1}}`).join(', ');
    const resultVals = results.map(val => format(val, { precision: 8 })).join(', ');
    solutionSteps.push(`\\( \\therefore (${resultVars}) = (${resultVals}) \\)`);
    return solutionSteps;
  }
  
  //@ Override: สำหรับแสดงผลลัพธ์ (แก้ไขให้ขึ้นบรรทัดใหม่ได้)
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
}

export default CramersRule;

