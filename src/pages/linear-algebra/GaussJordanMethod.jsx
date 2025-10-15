import React from "react";
import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs"; //* ใช้สำหรับจัดรูปแบบตัวเลขทศนิยม

class GaussJordanMethod extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Gauss Jordan Method";
  }

  //? Helper Functions (อัปเดต)
  //@ ฟังก์ชันสำหรับแปลง Augmented Matrix เป็น LaTeX
  MatrixToLatex = (matrix) => {
    //* เปลี่ยนจาก pmatrix เป็น bmatrix เพื่อให้แสดงเป็น []
    let latex = "\\begin{bmatrix}";
    latex += matrix.map(row => {
      //* แยกส่วน A และ B ออกจากกัน
      const rowA = row.slice(0, -1);
      const rowB = row[row.length - 1];
      //* สร้างแถวโดยมีเส้น | คั่นกลาง
      return rowA.join(' & ') + ' & | & ' + rowB;
    }).join(' \\\\ ');
    latex += "\\end{bmatrix}";
    return latex;
  };

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB, matrixSize } = this.state;
    //* แปลงเมทริกซ์จาก String เป็น Number (สร้างสำเนา)
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    //* ตรวจสอบว่ามี Input ที่ไม่ใช่ตัวเลขหรือไม่
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    //* สร้าง Augmented Matrix [A|B]
    const augmentedMatrix = numA.map((row, i) => [...row, numB[i]]);
    const N = matrixSize;
    //* Gauss-Jordan Elimination
    //* ทำให้เป็น Identity Matrix [I|x]
    for (let k = 0; k < N; k++) {
      //* 1. หา Pivot
      const pivot = augmentedMatrix[k][k];
      if (Math.abs(pivot) < 1e-9) {
        alert(`Pivot element at [${k+1},${k+1}] is zero. Gauss-Jordan method fails.`);
        this.setState({ solution: null });
        return;
      }
      //* 2. ทำให้ Pivot Element เป็น 1 (Normalize the pivot row)
      for (let j = k; j < N + 1; j++) {
        augmentedMatrix[k][j] /= pivot;
      }
      //* 3. ทำให้ Element อื่นในคอลัมน์ k เป็น 0
      for (let i = 0; i < N; i++) {
        if (i !== k) {
          const factor = augmentedMatrix[i][k];
          for (let j = k; j < N + 1; j++) {
            augmentedMatrix[i][j] -= factor * augmentedMatrix[k][j];
          }
        }
      }
    }
    //* ดึงผลลัพธ์
    //* ผลลัพธ์จะอยู่ในคอลัมน์สุดท้ายของ Augmented Matrix
    const results = augmentedMatrix.map(row => row[N]);
    //* เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
    const solutionSteps = this.generateSolutionSteps(augmentedMatrix, results);
    this.setState({ solution: solutionSteps });
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (finalMatrix, results) => {
    let solutionSteps = [];
    //* ส่วนแสดง Final Matrix
    solutionSteps.push(`\\( \\large{\\textbf{Final Augmented Matrix}} \\)`);
    //* จัดรูปแบบตัวเลขในเมทริกซ์ให้ดูสวยงาม
    const formattedMatrix = finalMatrix.map(row => 
        row.map(val => format(val, { notation: 'fixed', precision: 4 }))
    );
    solutionSteps.push(`\\( ${this.MatrixToLatex(formattedMatrix)} \\)`);
    //* ส่วนแสดงผลลัพธ์สุดท้าย
    const finalResultValues = results.map((val, i) => `x_{${i+1}} = ${format(val, { precision: 14 })}`).join(', \\quad ');
    solutionSteps.push(`\\( \\therefore ${finalResultValues} \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default GaussJordanMethod;

