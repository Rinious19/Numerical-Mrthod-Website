import React from "react";
import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs"; //* ใช้สำหรับจัดรูปแบบตัวเลขทศนิยม

class LUDecompositionMethod extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "LU Decomposition Method";
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
    let L = Array(n).fill(0).map(() => Array(n).fill(0));
    let U = Array(n).fill(0).map(() => Array(n).fill(0));
    try {
      //* 1. LU Decomposition (Doolittle's method)
      for (let i = 0; i < n; i++) {
        //* Upper Triangular
        for (let k = i; k < n; k++) {
          let sum = 0;
          for (let j = 0; j < i; j++) {
            sum += (L[i][j] * U[j][k]);
          }
          U[i][k] = numA[i][k] - sum;
        }
        //* Lower Triangular
        for (let k = i; k < n; k++) {
          if (i === k) {
            L[i][i] = 1; //* Diagonal of L is 1
          } else {
            let sum = 0;
            for (let j = 0; j < i; j++) {
              sum += (L[k][j] * U[j][i]);
            }
            if (Math.abs(U[i][i]) < 1e-9) {
              throw new Error("Pivot is zero, LU Decomposition fails.");
            }
            L[k][i] = (numA[k][i] - sum) / U[i][i];
          }
        }
      }
      //* 2. Forward Substitution (Ly = B)
      let y = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < i; j++) {
          sum += L[i][j] * y[j];
        }
        y[i] = numB[i] - sum;
      }
      //* 3. Backward Substitution (Ux = y)
      let x = new Array(n).fill(0);
      for (let i = n - 1; i >= 0; i--) {
        let sum = 0;
        for (let j = i + 1; j < n; j++) {
          sum += U[i][j] * x[j];
        }
        if (Math.abs(U[i][i]) < 1e-9) {
          throw new Error("Division by zero during back substitution.");
        }
        x[i] = (y[i] - sum) / U[i][i];
      }
      const solutionSteps = this.generateSolutionSteps(L, U, y, x, numA, numB);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert(error.message || "An error occurred during calculation.");
      this.setState({ solution: null });
      console.error(error);
    }
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (L, U, y, x, A, B) => {
    const N = this.state.matrixSize;
    let solutionSteps = [];
    const yVars = Array.from({ length: N }, (_, i) => `y_{${i + 1}}`);
    const xVars = Array.from({ length: N }, (_, i) => `x_{${i + 1}}`);
    //* Step 1: LU = A
    solutionSteps.push(`\\( \\large{\\textbf{1. LU Decomposition: } [L][U] = [A]} \\)`);
    const luLatex = `\\( ${this.matrixToLatex(L)} ${this.matrixToLatex(U)} = ${this.matrixToLatex(A)} \\)`;
    solutionSteps.push(luLatex);
    //* Step 2: Ly = B
    solutionSteps.push(`\\( \\large{\\textbf{2. Forward Substitution: } [L]\\{Y\\} = \\{B\\}} \\)`);
    const lyLatex = `\\( ${this.matrixToLatex(L)} ${this.vectorToLatex(yVars, true)} = ${this.vectorToLatex(B)} \\)`;
    solutionSteps.push(lyLatex);
    const yResults = y.map((val, i) => `y_{${i+1}} = ${format(val, { precision: 14 })}`).join(', \\quad ');
    solutionSteps.push(`\\( \\rightarrow Y = \\{ ${yResults} \\} \\)`);
    //* Step 3: Ux = y
    solutionSteps.push(`\\( \\large{\\textbf{3. Backward Substitution: } [U]\\{x\\} = \\{Y\\}} \\)`);
    const uxLatex = `\\( ${this.matrixToLatex(U)} ${this.vectorToLatex(xVars, true)} = ${this.vectorToLatex(y)} \\)`;
    solutionSteps.push(uxLatex);
    //* Final Result
    const finalResultValues = x.map((val, i) => `x_{${i+1}} = ${format(val, { precision: 14 })}`).join(', \\quad ');
    solutionSteps.push(`\\( \\therefore ${finalResultValues} \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default LUDecompositionMethod;
