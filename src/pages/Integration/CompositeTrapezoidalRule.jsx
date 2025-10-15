import BaseIntegration from "./BaseIntegration";
import { format } from "mathjs";

class CompositeTrapezoidalRule extends BaseIntegration {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Composite Trapezoidal Rule";
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
    try {
      const h = (b - a) / n;
      const fa = this.f(a);
      const fb = this.f(b);
      //* คำนวณผลรวมของฟังก์ชัน ณ จุดกึ่งกลาง
      let sum = 0;
      for (let i = 1; i < n; i++) {
        sum += this.f(a + i * h);
      }
      //* คำนวณด้วยสูตร Composite Trapezoidal Rule
      const integral = (h / 2) * (fa + 2 * sum + fb);
      //? ส่งค่า fa, fb, และ sum เพิ่มเข้าไป
      const solutionSteps = this.generateSolutionSteps(a, b, n, h, fa, fb, sum, integral);
      this.setState({ solution: solutionSteps });
    } catch (error) {
      alert("An error occurred during calculation. Please check your function syntax.");
      this.setState({ solution: null });
      console.error(error);
    }
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล (เขียนใหม่)
  generateSolutionSteps = (a, b, n, h, fa, fb, sum, result) => {
    let steps = [];
    //* 1. สูตร Composite Trapezoidal Rule
    steps.push(`\\( \\large{\\textbf{1. Composite Trapezoidal Rule Formula}} \\)`);
    steps.push(`\\( I \\approx \\frac{h}{2} [f(x_0) + 2\\sum_{i=1}^{n-1} f(x_i) + f(x_n)] \\)`);
    //* 2. คำนวณ h
    steps.push(`\\( \\large{\\textbf{2. Calculate h}} \\)`);
    steps.push(`\\( h = \\frac{b-a}{n} = \\frac{${b} - ${a}}{${n}} = ${format(h, {precision: 6})} \\)`);
    //* 3. ขั้นตอนการแทนค่า
    steps.push(`\\( \\large{\\textbf{3. Substitute Values & Calculate}} \\)`);
    const substitutionString = `\\( I \\approx \\frac{${format(h, {precision: 6})}}{2} [f(${a}) + 2(\\sum_{i=1}^{${n-1}} f(x_i)) + f(${b})] \\)`;
    steps.push(substitutionString);
    const valueString = `\\( I \\approx \\frac{${format(h, {precision: 6})}}{2} [${format(fa, {precision: 6})} + 2(${format(sum, {precision: 6})}) + ${format(fb, {precision: 6})}] \\)`;
    steps.push(valueString);
    //* 4. Result
    steps.push(`\\( \\large{\\textbf{4. Final Result}} \\)`);
    steps.push(`\\( I \\approx ${format(result, { precision: 14 })} \\)`);
    return steps;
  };
}

export default CompositeTrapezoidalRule;

