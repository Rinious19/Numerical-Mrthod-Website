import React from "react";
import BaseDifferentiation from "./BaseDifferentiation";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class BackwardDividedDifference extends BaseDifferentiation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Backward Divided Difference";
    this.state.diffType = 'backward'; //* กำหนดประเภทเพื่อให้ Dropdown แสดงผลถูกต้อง
  }

  //? Override Methods
  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { x: x_str, h: h_str, derivativeOrder, errorOrder } = this.state;
    const x = parseFloat(x_str);
    const h = parseFloat(h_str);
    if (isNaN(x) || isNaN(h)) {
        alert("Please enter valid numbers for Point (x) and Step Size (h).");
        return;
    }
    let result;
    let formula = '';
    let substitution = '';
    //* เลือกสูตรตาม Derivative Order และ Error Order
    const d = parseInt(derivativeOrder);
    const e = parseInt(errorOrder);
    //* First Derivative
    if (d === 1 && e === 1) { //* O(h)
        result = (this.f(x) - this.f(x - h)) / h;
        formula = `f'(x) \\approx \\frac{f(x) - f(x-h)}{h}`;
        substitution = `f'(${x}) \\approx \\frac{${this.f(x).toFixed(6)} - ${this.f(x-h).toFixed(6)}}{${h}}`;
    } else if (d === 1 && e === 2) { //* O(h^2)
        result = (3*this.f(x) - 4*this.f(x - h) + this.f(x - 2*h)) / (2 * h);
        formula = `f'(x) \\approx \\frac{3f(x) - 4f(x-h) + f(x-2h)}{2h}`;
        substitution = `f'(${x}) \\approx \\frac{3(${this.f(x).toFixed(6)}) - 4(${this.f(x-h).toFixed(6)}) + ${this.f(x-2*h).toFixed(6)}}{2(${h})}`;
    } 
    //* Second Derivative
    else if (d === 2 && e === 1) { //* O(h)
        result = (this.f(x) - 2*this.f(x - h) + this.f(x - 2*h)) / Math.pow(h, 2);
        formula = `f''(x) \\approx \\frac{f(x) - 2f(x-h) + f(x-2h)}{h^2}`;
        substitution = `f''(${x}) \\approx \\frac{${this.f(x).toFixed(6)} - 2(${this.f(x-h).toFixed(6)}) + ${this.f(x-2*h).toFixed(6)}}{${h}^2}`;
    } else if (d === 2 && e === 2) { //* O(h^2)
        result = (2*this.f(x) - 5*this.f(x - h) + 4*this.f(x - 2*h) - this.f(x - 3*h)) / Math.pow(h, 2);
        formula = `f''(x) \\approx \\frac{2f(x) - 5f(x-h) + 4f(x-2h) - f(x-3h)}{h^2}`;
        substitution = `f''(${x}) \\approx \\frac{2(${this.f(x).toFixed(6)}) - 5(${this.f(x-h).toFixed(6)}) + 4(${this.f(x-2*h).toFixed(6)}) - ${this.f(x-3*h).toFixed(6)}}{${h}^2}`;
    }
    //* Third Derivative
    else if (d === 3 && e === 1) { //* O(h)
        result = (this.f(x) - 3*this.f(x - h) + 3*this.f(x - 2*h) - this.f(x - 3*h)) / Math.pow(h, 3);
        formula = `f'''(x) \\approx \\frac{f(x) - 3f(x-h) + 3f(x-2h) - f(x-3h)}{h^3}`;
        substitution = `f'''(${x}) \\approx \\frac{${this.f(x).toFixed(6)} - 3(${this.f(x-h).toFixed(6)}) + 3(${this.f(x-2*h).toFixed(6)}) - ${this.f(x-3*h).toFixed(6)}}{${h}^3}`;
    } else if (d === 3 && e === 2) { //* O(h^2)
        result = (5*this.f(x) - 18*this.f(x - h) + 24*this.f(x - 2*h) - 14*this.f(x - 3*h) + 3*this.f(x - 4*h)) / (2 * Math.pow(h, 3));
        formula = `f'''(x) \\approx \\frac{5f(x) - 18f(x-h) + 24f(x-2h) - 14f(x-3h) + 3f(x-4h)}{2h^3}`;
        substitution = `f'''(${x}) \\approx \\frac{5(${this.f(x).toFixed(6)}) - 18(${this.f(x-h).toFixed(6)}) + 24(${this.f(x-2*h).toFixed(6)}) - 14(${this.f(x-3*h).toFixed(6)}) + 3(${this.f(x-4*h).toFixed(6)})}{2(${h})^3}`;
    }
    //* Fourth Derivative
    else if (d === 4 && e === 1) { //* O(h)
        result = (this.f(x) - 4*this.f(x - h) + 6*this.f(x - 2*h) - 4*this.f(x - 3*h) + this.f(x - 4*h)) / Math.pow(h, 4);
        formula = `f''''(x) \\approx \\frac{f(x) - 4f(x-h) + 6f(x-2h) - 4f(x-3h) + f(x-4h)}{h^4}`;
        substitution = `f''''(${x}) \\approx \\frac{${this.f(x).toFixed(6)} - 4(${this.f(x-h).toFixed(6)}) + 6(${this.f(x-2*h).toFixed(6)}) - 4(${this.f(x-3*h).toFixed(6)}) + ${this.f(x-4*h).toFixed(6)}}{${h}^4}`;
    } else if (d === 4 && e === 2) { //* O(h^2)
        result = (3*this.f(x) - 14*this.f(x - h) + 26*this.f(x - 2*h) - 24*this.f(x - 3*h) + 11*this.f(x - 4*h) - 2*this.f(x - 5*h)) / Math.pow(h, 4);
        formula = `f''''(x) \\approx \\frac{3f(x) - 14f(x-h) + 26f(x-2h) - 24f(x-3h) + 11f(x-4h) - 2f(x-5h)}{h^4}`;
        substitution = `f''''((${x}) \\approx \\frac{3(${this.f(x).toFixed(6)}) - 14(${this.f(x-h).toFixed(6)}) + 26(${this.f(x-2*h).toFixed(6)}) - 24(${this.f(x-3*h).toFixed(6)}) + 11(${this.f(x-4*h).toFixed(6)}) - 2(${this.f(x-5*h).toFixed(6)})}{${h}^4}`;
    }
    else {
        alert("The selected derivative and error order combination is not implemented yet.");
        this.setState({ solution: null });
        return;
    }
    if (isNaN(result)) {
        alert("Calculation resulted in NaN. Please check your function and input values.");
        this.setState({ solution: null });
        return;
    }
    //* เรียกใช้ Method เพื่อสร้างขั้นตอนการแสดงผล
    const solutionSteps = this.generateSolutionSteps(formula, substitution, result);
    this.setState({ solution: solutionSteps });
  };

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล
  generateSolutionSteps = (formula, substitution, result) => {
    let steps = [];
    steps.push(`\\( \\large{\\textbf{1. Formula}} \\)`);
    steps.push(`\\( ${formula} \\)`);
    steps.push(`\\( \\large{\\textbf{2. Substitute Values}} \\)`);
    steps.push(`\\( ${substitution} \\)`);
    steps.push(`\\( \\large{\\textbf{3. Final Result}} \\)`);
    steps.push(`\\( \\approx ${format(result, { precision: 14 })} \\)`);
    return steps;
  };
  
  //? ไม่ต้อง Override renderForm() และ renderSolution() เพราะจะใช้ของจาก Base Class ได้เลย
}

export default BackwardDividedDifference;
