import React from "react";
import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { MathJax } from "better-react-mathjax";
import { format, transpose } from "mathjs"; //* Import transpose เพิ่ม

class CholeskyDecompositionMethod extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Cholesky Decomposition Method";
  }

  //? Helper Functions
  //@ ฟังก์ชันสำหรับแปลงเมทริกซ์เป็น LaTeX
  matrixToLatex = (matrix, type = 'bmatrix') => {
    let latex = `\\begin{${type}}`;
    latex += matrix.map(row => 
      row.map(val => format(val, { notation: 'fixed', precision: 4 })).join(' & ')
    ).join(' \\\\ ');
    latex += `\\end{${type}}`;
    return latex;
  };

  //@ ฟังก์ชันสำหรับแปลงเวกเตอร์เป็น LaTeX
  vectorToLatex = (vector, isVariable = false) => {
    let latex = "\\begin{Bmatrix}";
    if (isVariable) {
      latex += vector.join(' \\\\ ');
    } else {
      latex += vector.map(val => format(val, { notation: 'fixed', precision: 4 })).join(' \\\\ ');
    }
    latex += "\\end{Bmatrix}";
    return latex;
  };

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB, matrixSize } = this.state;
    //* แปลงเมทริกซ์จาก String เป็น Number (สร้างสำเนา)
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    //* ตรวจสอบ Input
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    const n = matrixSize;
    //* 1. ตรวจสอบว่าเมทริกซ์ A เป็นเมทริกซ์สมมาตรหรือไม่
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < i; j++) {
        if (numA[i][j] !== numA[j][i]) {
          alert("Matrix A is not symmetric. Cholesky Decomposition cannot be applied.");
          this.setState({ solution: null });
          return;
        }
      }
    }
    let L = Array(n).fill(0).map(() => Array(n).fill(0));
    try {
      //* 2. Cholesky Decomposition (A = LLᵀ)
      for (let i = 0; i < n; i++) {
        for (let j = 0; j <= i; j++) {
          let sum = 0;
          for (let k = 0; k < j; k++) {
            sum += L[i][k] * L[j][k];
          }
          if (i === j) {
            const valueUnderSqrt = numA[i][i] - sum;
            if (valueUnderSqrt < 0) {
              throw new Error("Matrix is not positive-definite. Cholesky Decomposition fails.");
            }
            L[i][j] = Math.sqrt(valueUnderSqrt);
          } else {
            if (Math.abs(L[j][j]) < 1e-9) {
              throw new Error("Division by zero. Cholesky Decomposition fails.");
            }
            L[i][j] = (1.0 / L[j][j] * (numA[i][j] - sum));
          }
        }
      }
      const LT = transpose(L); //* สร้าง L Transpose
      //* 3. Forward Substitution (Ly = B)
      let y = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += L[i][j] * y[j];
        }
        if (Math.abs(L[i][i]) < 1e-9) {
            throw new Error("Division by zero during forward substitution.");
        }
        y[i] = (numB[i] - sum) / L[i][i];
      }
      //* 4. Backward Substitution (Lᵀx = y)
      let x = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
          sum += LT[i][j] * x[j];
        }
        if (Math.abs(LT[i][i]) < 1e-9) {
          throw new Error("Division by zero during back substitution.");
        }
        x[i] = (y[i] - sum) / LT[i][i];
      }
      const solutionSteps = this.generateSolutionSteps(L, LT, y, x, numA, numB);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert(error.message || "An error occurred during calculation.");
      this.setState({ solution: null });
      console.error(error);
    }
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (L, LT, y, x, A, B) => {
    const N = this.state.matrixSize;
    let solutionSteps = [];
    const yVars = Array.from({ length: N }, (_, i) => `y_{${i + 1}}`);
    const xVars = Array.from({ length: N }, (_, i) => `x_{${i + 1}}`);
    //* Step 1: A = LLᵀ
    solutionSteps.push(`\\( \\large{\\textbf{1. Cholesky Decomposition: } [A] = [L][L]^T} \\)`);
    const luLatex = `\\( ${this.matrixToLatex(A)} = ${this.matrixToLatex(L)} ${this.matrixToLatex(LT)} \\)`;
    solutionSteps.push(luLatex);
    //* Step 2: Ly = B
    solutionSteps.push(`\\( \\large{\\textbf{2. Forward Substitution: } [L]\\{Y\\} = \\{B\\}} \\)`);
    const lyLatex = `\\( ${this.matrixToLatex(L)} ${this.vectorToLatex(yVars, true)} = ${this.vectorToLatex(B)} \\)`;
    solutionSteps.push(lyLatex);
    const yResults = y.map((val, i) => `y_{${i+1}} = ${format(val, { precision: 14 })}`).join(', \\quad ');
    solutionSteps.push(`\\( \\rightarrow Y = \\{ ${yResults} \\} \\)`);
    //* Step 3: Lᵀx = y
    solutionSteps.push(`\\( \\large{\\textbf{3. Backward Substitution: } [L]^T\\{x\\} = \\{Y\\}} \\)`);
    const uxLatex = `\\( ${this.matrixToLatex(LT)} ${this.vectorToLatex(xVars, true)} = ${this.vectorToLatex(y)} \\)`;
    solutionSteps.push(uxLatex);
    //* Final Result
    const finalResultValues = x.map((val, i) => `x_{${i+1}} = ${format(val, { precision: 14 })}`).join(', \\quad ');
    solutionSteps.push(`\\( \\therefore ${finalResultValues} \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default CholeskyDecompositionMethod;
