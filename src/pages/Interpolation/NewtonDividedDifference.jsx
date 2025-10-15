import React from "react";
import BaseInterpolation from "./BaseInterpolation";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class NewtonDividedDifference extends BaseInterpolation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Newton's Divided-Difference";
  }

  //? Helper Functions

  //@ ฟังก์ชันสำหรับแปลงตาราง Divided-Difference เป็น LaTeX
  tableToLatex = (points, table) => {
    let header = "i & x_i & y_i";
    for (let i = 1; i < points.length; i++) {
      header += ` & f[${','.repeat(i)}]`;
    }
    let rows = points.map((p, i) => {
      let row = `${i} & ${p.x} & ${p.y}`;
      for (let j = 0; j < table[i].length; j++) {
        const val = table[i][j];
        //* แสดงค่าก็ต่อเมื่อมีค่าอยู่จริง (ไม่ใช่ undefined)
        row += ` & ${val !== undefined ? format(val, { notation: 'fixed', precision: 6 }) : ''}`;
      }
      return row;
    }).join(' \\\\ ');
    let latex = `\\begin{array}{|${'c|'.repeat(points.length + 2)}} \\hline ${header} \\\\ \\hline ${rows} \\\\ \\hline \\end{array}`;
    return latex;
  };

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { points, targetX } = this.state;
    //* แปลง Input ทั้งหมดเป็นตัวเลข
    const numPoints = points.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    const numTargetX = parseFloat(targetX);
    //* ตรวจสอบ Input
    if (numPoints.some(p => isNaN(p.x) || isNaN(p.y)) || isNaN(numTargetX)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    const n = numPoints.length;
    //* สร้างตาราง Divided-Difference (ขนาด n x n)
    let divDiffTable = Array(n).fill(0).map(() => Array(n).fill(undefined));
    //* 1. เติมคอลัมน์แรกด้วยค่า y
    for (let i = 0; i < n; i++) {
      divDiffTable[i][0] = numPoints[i].y;
    }
    //* 2. คำนวณค่าในตารางส่วนที่เหลือ
    for (let j = 1; j < n; j++) { //* Loop สำหรับคอลัมน์ (order of difference)
      for (let i = j; i < n; i++) { //* Loop สำหรับแถว
        divDiffTable[i][j] = (divDiffTable[i][j - 1] - divDiffTable[i - 1][j - 1]) / (numPoints[i].x - numPoints[i - j].x);
      }
    }
    //* 3. ดึงค่าสัมประสิทธิ์ (coefficients) จากแนวทแยงมุมบนสุดของตาราง
    const coefficients = [];
    for (let i = 0; i < n; i++) {
      coefficients.push(divDiffTable[i][i]);
    }
    //* 4. คำนวณหาค่า y ที่ประมาณได้ (Interpolated Value)
    let yInterpolated = coefficients[0];
    for (let i = 1; i < n; i++) {
      let term = coefficients[i];
      for (let j = 0; j < i; j++) {
        term *= (numTargetX - numPoints[j].x);
      }
      yInterpolated += term;
    }
    //* 5. เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
    const solutionSteps = this.generateSolutionSteps(numPoints, divDiffTable, coefficients, numTargetX, yInterpolated);
    this.setState({ solution: solutionSteps });
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (points, table, coefficients, targetX, result) => {
    let solutionSteps = [];
    const n = points.length;
    //* 1. แสดงตาราง Divided-Difference
    solutionSteps.push(`\\( \\large{\\textbf{1. Divided-Difference Table}} \\)`);
    //* ตัดคอลัมน์แรก (y_i) ออกจาก table เพราะเราจะแสดงจาก points.y
    const displayTable = table.map(row => row.slice(1));
    solutionSteps.push(`\\( ${this.tableToLatex(points, displayTable)} \\)`);
    //* 2. สร้างสมการพหุนาม (Polynomial)
    solutionSteps.push(`\\( \\large{\\textbf{2. Newton's Polynomial}} \\)`);
    let polynomial = `P_{${n-1}}(x) = ${format(coefficients[0], {precision: 4})}`;
    for (let i = 1; i < n; i++) {
      const coeff = coefficients[i];
      //* แสดงเครื่องหมายบวกหรือลบตามค่าสัมประสิทธิ์
      polynomial += (coeff >= 0 ? ' + ' : ' - ');
      polynomial += `${format(Math.abs(coeff), {precision: 4})}`;
      for (let j = 0; j < i; j++) {
        polynomial += `(x - ${points[j].x})`;
      }
    }
    solutionSteps.push(`\\( ${polynomial} \\)`);
    //* 3. แทนค่า x ที่ต้องการหา
    solutionSteps.push(`\\( \\large{\\textbf{3. Interpolate at }} x = ${targetX} \\)`);
    solutionSteps.push(`\\( P_{${n-1}}(${targetX}) = ${format(result, { precision: 14 })} \\)`);
    //* 4. ผลลัพธ์สุดท้าย
    solutionSteps.push(`\\( \\therefore f(${targetX}) \\approx ${format(result, { precision: 14 })} \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default NewtonDividedDifference;
