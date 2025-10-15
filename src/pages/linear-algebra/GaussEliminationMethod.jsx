import BaseLinearAlgebra from "./BaseLinearAlgebra";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs"; //* ใช้สำหรับจัดรูปแบบตัวเลขทศนิยม

class GaussEliminationMethod extends BaseLinearAlgebra {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Gauss Elimination Method";
  }

  //? Helper Functions
  //@ ฟังก์ชันสำหรับแปลง Augmented Matrix เป็น LaTeX
  MatrixToLatex = (matrix) => {
    let latex = "\\begin{pmatrix}";
    latex += matrix.map(row => {
      //* แยกส่วน A และ B ออกจากกัน
      const rowA = row.slice(0, -1);
      const rowB = row[row.length - 1];
      //* สร้างแถวโดยมีเส้น | คั่นกลาง
      return rowA.join(' & ') + ' & | & ' + rowB;
    }).join(' \\\\ ');
    latex += "\\end{pmatrix}";
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
    //* สร้าง Augmented Matrix [A|B] (สร้างสำเนาเพื่อไม่ให้กระทบ state เดิม)
    const augmentedMatrix = numA.map((row, i) => [...row, numB[i]]);
    const n = matrixSize;
    //* 1. Forward Elimination
    //* ทำให้เป็น Upper Triangular Matrix
    for (let k = 0; k < n - 1; k++) {
      //* ตรวจสอบ Pivot Element
      if (Math.abs(augmentedMatrix[k][k]) < 1e-9) {
        alert(`Pivot element at [${k+1},${k+1}] is zero. Gauss Elimination may fail.`);
        this.setState({ solution: null });
        return;
      }
      for (let i = k + 1; i < n; i++) {
        const factor = augmentedMatrix[i][k] / augmentedMatrix[k][k];
        for (let j = k; j < n + 1; j++) {
          augmentedMatrix[i][j] -= factor * augmentedMatrix[k][j];
        }
      }
    }
    //* 2. Back Substitution
    //* คำนวณหาค่า x จากสมการด้านบนสุดลงมา
    const results = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += augmentedMatrix[i][j] * results[j];
      }
      //* ตรวจสอบตัวหาร
      if (Math.abs(augmentedMatrix[i][i]) < 1e-9) {
        alert("Division by zero during back substitution.");
        this.setState({ solution: null });
        return;
      }
      results[i] = (augmentedMatrix[i][n] - sum) / augmentedMatrix[i][i];
    }
    //* 3. เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
    const solutionSteps = this.generateSolutionSteps(augmentedMatrix, results);
    this.setState({ solution: solutionSteps });
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (finalMatrix, results) => {
    const N = this.state.matrixSize;
    let solutionSteps = [];
    //* ส่วนแสดง Back Substitution
    solutionSteps.push(`\\( \\large{\\textbf{Back Substitution}} \\)`);
    //* สร้างสมการสำหรับแต่ละ xᵢ
    for (let i = N - 1; i >= 0; i--) {
        let numeratorLatex = `${format(finalMatrix[i][N], { precision: 4 })}`;
        let sumTerms = [];
        //* สร้างส่วนของการลบ (a_ij * x_j)
        for (let j = i + 1; j < N; j++) {
            sumTerms.push(`(${format(finalMatrix[i][j], { precision: 4 })})(${format(results[j], { precision: 4 })})`);
        }
        if (sumTerms.length > 0) {
            numeratorLatex += ` - \\left( ${sumTerms.join(' + ')} \\right)`;
        }
        const denominatorLatex = `${format(finalMatrix[i][i], { precision: 4 })}`;
        const resultLatex = format(results[i], { precision: 8 });
        let stepLatex = `\\( x_{${i + 1}} = \\frac{${numeratorLatex}}{${denominatorLatex}} = ${resultLatex} \\)`;
        solutionSteps.push(stepLatex);
    }
    //* ส่วนแสดงผลลัพธ์สุดท้าย
    const finalResultValues = results.map((val, i) => `x_{${i+1}} = ${format(val, { precision: 8 })}`).join(', \\quad ');
    solutionSteps.push(`\\( \\therefore ${finalResultValues} \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default GaussEliminationMethod;

