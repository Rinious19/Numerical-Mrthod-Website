import React from "react";
import BaseInterpolation from "./BaseInterpolation";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class LagrangeInterpolation extends BaseInterpolation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Lagrange Interpolation";
  }

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
    let yInterpolated = 0;
    const lValues = []; //* Array สำหรับเก็บค่า Lᵢ แต่ละตัว
    //* 1. คำนวณ Lagrange Polynomial
    for (let i = 0; i < n; i++) {
      let li = 1;
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          li *= (numTargetX - numPoints[j].x) / (numPoints[i].x - numPoints[j].x);
        }
      }
      lValues.push(li); //* เก็บค่า Lᵢ ที่คำนวณได้
      yInterpolated += li * numPoints[i].y;
    }
    //* 2. เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
    const solutionSteps = this.generateSolutionSteps(numPoints, numTargetX, lValues, yInterpolated);
    this.setState({ solution: solutionSteps });
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (points, targetX, lValues, result) => {
    let solutionSteps = [];
    const n = points.length;
    //* 1. แสดงการคำนวณ Lᵢ แต่ละตัว
    for (let i = 0; i < n; i++) {
      let numeratorLatex = '';
      let denominatorLatex = '';
      let numNumeratorValues = '';
      let numDenominatorValues = '';
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          //* สร้างส่วนของสูตร
          numeratorLatex += `(x - x_{${j}})`;
          denominatorLatex += `(x_{${i}} - x_{${j}})`;
          //* สร้างส่วนของการแทนค่า
          numNumeratorValues += `(${targetX} - ${points[j].x})`;
          numDenominatorValues += `(${points[i].x} - ${points[j].x})`;
        }
      }
      const l_i_Latex = `L_{${i}}(x) = \\frac{${numeratorLatex}}{${denominatorLatex}} = \\frac{${numNumeratorValues}}{${numDenominatorValues}} = ${format(lValues[i], { precision: 14 })}`;
      solutionSteps.push(`\\( ${l_i_Latex} \\)`);
    }
    //* 2. สร้างสมการ P(x) และแทนค่า
    let polynomialSum = `P_{${n-1}}(x) = ` + lValues.map((_, i) => `L_{${i}}(x)f(x_{${i}})`).join(' + ');
    solutionSteps.push(`\\( ${polynomialSum} \\)`);
    //* สร้างส่วนของการแทนค่า
    let substitution = `P_{${n-1}}(${targetX}) = ` + lValues.map((val, i) => 
      `(${format(val, { precision: 6 })})(${points[i].y})`
    ).join(' + ');
    solutionSteps.push(`\\( ${substitution} \\)`);
    //* แสดงผลลัพธ์
    solutionSteps.push(`\\( = ${format(result, { precision: 14 })} \\)`);
    //* 3. ผลลัพธ์สุดท้าย
    solutionSteps.push(`\\( \\therefore f(${targetX}) \\approx ${format(result, { precision: 14 })} \\)`);
    return solutionSteps;
  };
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะใช้ของจาก Base Class ได้เลย
}

export default LagrangeInterpolation;
