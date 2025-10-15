import React from "react";
import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { MathJax } from "better-react-mathjax";
import { format, inv, multiply } from "mathjs"; //* Import inv and multiply

class MatrixInversion extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Matrix Inversion Method";
  }

  //? Helper Functions (อัปเดต)
  //@ ฟังก์ชันสำหรับแปลง Array 2D (Matrix) เป็น LaTeX bmatrix
  matrixToLatex = (matrix) => {
    let latex = "\\begin{bmatrix}";
    latex += matrix.map(row => row.map(val => format(val, { notation: 'fixed', precision: 4 })).join(' & ')).join(' \\\\ ');
    latex += "\\end{bmatrix}";
    return latex;
  };

  //@ ฟังก์ชันใหม่สำหรับแปลง Array 1D (Vector) เป็น LaTeX Bmatrix (ปีกกา)
  vectorToLatex = (vector) => {
    let latex = "\\begin{Bmatrix}";
    //* ตรวจสอบว่าเป็น vector ของ string (เช่น x_1) หรือตัวเลข
    if (typeof vector[0] === 'string') {
      //* ถ้าเป็น string, ไม่ต้อง format เพื่อป้องกันสัญลักษณ์ที่ไม่ต้องการ
      latex += vector.join(' \\\\ ');
    } else {
      //* ถ้าเป็นตัวเลข, ให้ format เหมือนเดิม
      latex += vector.map(val => format(val, { notation: 'fixed', precision: 4 })).join(' \\\\ ');
    }
    latex += "\\end{Bmatrix}";
    return latex;
  };

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB } = this.state;
    //* แปลงเมทริกซ์จาก String เป็น Number (สร้างสำเนา)
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    //* ตรวจสอบว่ามี Input ที่ไม่ใช่ตัวเลขหรือไม่
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    try {
      //* 1. หา Inverse ของ Matrix A
      const invA = inv(numA);
      //* 2. คูณ A⁻¹ กับ B เพื่อหา x
      const results = multiply(invA, numB);
      //* 3. เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
      const solutionSteps = this.generateSolutionSteps(invA, numB, results);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      //* mathjs throws an error if the matrix is singular (determinant is zero)
      alert("Cannot calculate inverse. The matrix may be singular (determinant is zero).");
      this.setState({ solution: null });
      console.error("Matrix Inversion Error:", error);
    }
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล (อัปเดต)
  generateSolutionSteps = (invA, numB, results) => {
    let solutionSteps = [];
    const N = this.state.matrixSize;
    //* ส่วนแสดง Formulas
    solutionSteps.push(`\\( \\large{\\text{From }} Ax = B \\)`);
    solutionSteps.push(`\\( \\large{A^{-1}B = x} \\)`);
    //* ส่วนแสดงการคูณเมทริกซ์
    const xVector = Array.from({ length: N }, (_, i) => `x_{${i + 1}}`);
    //* ใช้ helper function ตัวใหม่ในการสร้าง LaTeX สำหรับเวกเตอร์
    const multiplicationLatex = `\\( ${this.matrixToLatex(invA)} ${this.vectorToLatex(numB)} = ${this.vectorToLatex(xVector)} \\)`;
    solutionSteps.push(multiplicationLatex);
    //* ส่วนแสดงผลลัพธ์สุดท้าย
    const finalResultVars = results.map((_, i) => `x_{${i+1}}`).join(', ');
    const finalResultValues = results.map(val => format(val, { precision: 14 })).join(', ');
    solutionSteps.push(`\\( \\therefore (${finalResultVars}) = (${finalResultValues}) \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default MatrixInversion;

