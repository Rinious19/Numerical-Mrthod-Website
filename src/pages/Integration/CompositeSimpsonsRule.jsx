import React from "react";
import BaseIntegration from "./BaseIntegration";
import { Form, Button, Row, Col } from "react-bootstrap";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class CompositeSimpsonsRule extends BaseIntegration {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Composite Simpson's Rule (1/3)";
  }

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { fx, lowerBound, upperBound, segments } = this.state;
    //* แปลง Input เป็นตัวเลข
    const a = parseFloat(lowerBound);
    const b = parseFloat(upperBound);
    const n = parseInt(segments);
    //* ตรวจสอบ Input
    if (isNaN(a) || isNaN(b) || isNaN(n) || !fx) {
        alert("Please enter a valid function, bounds, and number of segments.");
        return;
    }
    if (n <= 0) {
        alert("Number of segments (n) must be a positive integer.");
        return;
    }
    //? เงื่อนไขสำคัญ: Simpson's Rule ต้องใช้จำนวนช่วงเป็นเลขคู่
    if (n % 2 !== 0) {
        alert("Number of segments (n) must be an even number for Simpson's 1/3 Rule.");
        return;
    }
    try {
      const h = (b - a) / (2*n);
      const fa = this.f(a);
      const fb = this.f(b);
      //* คำนวณผลรวมของฟังก์ชัน ณ จุดคี่ (4 * sum)
      let sumOdd = 0;
      for (let i = 1; i < 2*n; i += 2) {
        sumOdd += this.f(a + i * h);
      }
      //* คำนวณผลรวมของฟังก์ชัน ณ จุดคู่ (2 * sum)
      let sumEven = 0;
      for (let i = 2; i < 2*n; i += 2) {
        sumEven += this.f(a + i * h);
      }
      //* คำนวณด้วยสูตร Composite Simpson's 1/3 Rule
      const integral = (h / 3) * (fa + 4 * sumOdd + 2 * sumEven + fb);
      //* เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
      const solutionSteps = this.generateSolutionSteps(a, b, n, h, fa, fb, sumOdd, sumEven, integral);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert("An error occurred during calculation. Please check your function syntax.");
      this.setState({ solution: null });
      console.error(error);
    }
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (a, b, n, h, fa, fb, sumOdd, sumEven, result) => {
    let steps = [];
    steps.push(`\\( \\large{\\textbf{1. Composite Simpson's 1/3 Rule Formula}} \\)`);
    steps.push(`\\( I \\approx \\frac{h}{3} [f(x_0) + 4\\sum_{i=1,3,5}^{n-1} f(x_i) + 2\\sum_{j=2,4,6}^{n-2} f(x_j) + f(x_n)] \\)`);
    steps.push(`\\( \\large{\\textbf{2. Calculate h}} \\)`);
    steps.push(`\\( h = \\frac{b-a}{2n} = \\frac{${b} - ${a}}{${2*n}} = ${format(h, {precision: 6})} \\)`);
    steps.push(`\\( \\large{\\textbf{3. Substitute Values & Calculate}} \\)`);
    steps.push(`\\( I \\approx \\frac{${format(h, {precision: 6})}}{3} [${format(fa, {precision: 6})} + 4(${format(sumOdd, {precision: 6})}) + 2(${format(sumEven, {precision: 6})}) + ${format(fb, {precision: 6})}] \\)`);
    steps.push(`\\( \\large{\\textbf{4. Final Result}} \\)`);
    steps.push(`\\( I \\approx ${format(result, { precision: 14 })} \\)`);
    return steps;
  };
}

export default CompositeSimpsonsRule;
