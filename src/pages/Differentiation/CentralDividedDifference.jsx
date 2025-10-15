import React from "react";
import BaseDifferentiation from "./BaseDifferentiation";
import { MathJax } from "better-react-mathjax";
import { format } from "mathjs";

class CentralDividedDifference extends BaseDifferentiation {
  //@ Constructor
  constructor(props) {
    super(props);
    //* กำหนดค่าเริ่มต้นสำหรับ State ของ Method นี้โดยเฉพาะ
    this.state.title = "Central Divided Difference";
    this.state.diffType = 'central'; //* กำหนดประเภทเพื่อให้ Dropdown แสดงผลถูกต้อง
    this.state.errorOrder = 2; //* Central ควรเริ่มต้นที่ O(h^2)
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
    if (d === 1 && e === 2) { //* O(h^2)
        result = (this.f(x + h) - this.f(x - h)) / (2 * h);
        formula = `f'(x) \\approx \\frac{f(x+h) - f(x-h)}{2h}`;
        substitution = `f'(${x}) \\approx \\frac{${this.f(x+h).toFixed(6)} - ${this.f(x-h).toFixed(6)}}{2(${h})}`;
    } else if (d === 1 && e === 4) { //* O(h^4)
        result = (-this.f(x + 2*h) + 8*this.f(x + h) - 8*this.f(x - h) + this.f(x - 2*h)) / (12 * h);
        formula = `f'(x) \\approx \\frac{-f(x+2h) + 8f(x+h) - 8f(x-h) + f(x-2h)}{12h}`;
        substitution = `f'(${x}) \\approx \\frac{-(${this.f(x+2*h).toFixed(6)}) + 8(${this.f(x+h).toFixed(6)}) - 8(${this.f(x-h).toFixed(6)}) + ${this.f(x-2*h).toFixed(6)}}{12(${h})}`;
    } 
    //* Second Derivative
    else if (d === 2 && e === 2) { //* O(h^2)
        result = (this.f(x + h) - 2*this.f(x) + this.f(x - h)) / Math.pow(h, 2);
        formula = `f''(x) \\approx \\frac{f(x+h) - 2f(x) + f(x-h)}{h^2}`;
        substitution = `f''(${x}) \\approx \\frac{${this.f(x+h).toFixed(6)} - 2(${this.f(x).toFixed(6)}) + ${this.f(x-h).toFixed(6)}}{${h}^2}`;
    } else if (d === 2 && e === 4) { //* O(h^4)
        result = (-this.f(x + 2*h) + 16*this.f(x + h) - 30*this.f(x) + 16*this.f(x - h) - this.f(x - 2*h)) / (12 * Math.pow(h, 2));
        formula = `f''(x) \\approx \\frac{-f(x+2h) + 16f(x+h) - 30f(x) + 16f(x-h) - f(x-2h)}{12h^2}`;
        substitution = `f''(${x}) \\approx \\frac{-(${this.f(x+2*h).toFixed(6)}) + 16(${this.f(x+h).toFixed(6)}) - 30(${this.f(x).toFixed(6)}) + 16(${this.f(x-h).toFixed(6)}) - ${this.f(x-2*h).toFixed(6)}}{12(${h})^2}`;
    }
    //* Third Derivative
    else if (d === 3 && e === 2) { //* O(h^2)
        result = (this.f(x + 2*h) - 2*this.f(x + h) + 2*this.f(x - h) - this.f(x - 2*h)) / (2 * Math.pow(h, 3));
        formula = `f'''(x) \\approx \\frac{f(x+2h) - 2f(x+h) + 2f(x-h) - f(x-2h)}{2h^3}`;
        substitution = `f'''(${x}) \\approx \\frac{${this.f(x+2*h).toFixed(6)} - 2(${this.f(x+h).toFixed(6)}) + 2(${this.f(x-h).toFixed(6)}) - ${this.f(x-2*h).toFixed(6)}}{2(${h})^3}`;
    } else if (d === 3 && e === 4) { //* O(h^4)
        result = (-this.f(x + 3*h) + 8*this.f(x + 2*h) - 13*this.f(x + h) + 13*this.f(x - h) - 8*this.f(x - 2*h) + this.f(x - 3*h)) / (8 * Math.pow(h, 3));
        formula = `f'''(x) \\approx \\frac{-f(x+3h) + 8f(x+2h) - 13f(x+h) + 13f(x-h) - 8f(x-2h) + f(x-3h)}{8h^3}`;
        substitution = `f'''(${x}) \\approx \\frac{-(${this.f(x+3*h).toFixed(6)}) + 8(${this.f(x+2*h).toFixed(6)}) - 13(${this.f(x+h).toFixed(6)}) + 13(${this.f(x-h).toFixed(6)}) - 8(${this.f(x-2*h).toFixed(6)}) + ${this.f(x-3*h).toFixed(6)}}{8(${h})^3}`;
    }
    //* Fourth Derivative
    else if (d === 4 && e === 2) { //* O(h^2)
        result = (this.f(x + 2*h) - 4*this.f(x + h) + 6*this.f(x) - 4*this.f(x - h) + this.f(x - 2*h)) / Math.pow(h, 4);
        formula = `f''''(x) \\approx \\frac{f(x+2h) - 4f(x+h) + 6f(x) - 4f(x-h) + f(x-2h)}{h^4}`;
        substitution = `f''''(${x}) \\approx \\frac{${this.f(x+2*h).toFixed(6)} - 4(${this.f(x+h).toFixed(6)}) + 6(${this.f(x).toFixed(6)}) - 4(${this.f(x-h).toFixed(6)}) + ${this.f(x-2*h).toFixed(6)}}{${h}^4}`;
    } else if (d === 4 && e === 4) { //* O(h^4)
        result = (-this.f(x + 3*h) + 12*this.f(x + 2*h) - 39*this.f(x + h) + 56*this.f(x) - 39*this.f(x - h) + 12*this.f(x - 2*h) - this.f(x - 3*h)) / (6 * Math.pow(h, 4));
        formula = `f''''(x) \\approx \\frac{-f(x+3h) + 12f(x+2h) - 39f(x+h) + 56f(x) - 39f(x-h) + 12f(x-2h) - f(x-3h)}{6h^4}`;
        substitution = `f''''((${x}) \\approx \\frac{-(${this.f(x+3*h).toFixed(6)}) + 12(${this.f(x+2*h).toFixed(6)}) - 39(${this.f(x+h).toFixed(6)}) + 56(${this.f(x).toFixed(6)}) - 39(${this.f(x-h).toFixed(6)}) + 12(${this.f(x-2*h).toFixed(6)}) - ${this.f(x-3*h).toFixed(6)}}{6(${h})^4}`;
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

export default CentralDividedDifference;
