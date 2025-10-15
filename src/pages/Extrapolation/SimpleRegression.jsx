import React from "react";
import BaseInterpolation from "../Interpolation/BaseInterpolation";
import { Form, Button, Row, Col, InputGroup, Card } from "react-bootstrap";
import Plot from "react-plotly.js";
import { MathJax } from "better-react-mathjax";
import { format, lusolve, multiply, transpose } from "mathjs";

//* แก้ไขชื่อคลาสกลับเป็น PolynomialRegression เพื่อความชัดเจน
class SimpleRegression extends BaseInterpolation {
  //@ Override Constructor
  constructor(props) {
    super(props);
    this.state.title = "Polynomial Regression";
    this.state.polynomialOrder = 1;
  }

  //? Helper Functions สำหรับสร้าง LaTeX
  matrixToLatex = (matrix) => {
    let latex = "\\begin{bmatrix}";
    latex += matrix.map(row => row.map(val => format(val, { notation: 'fixed', precision: 2 })).join(' & ')).join(' \\\\ ');
    latex += "\\end{bmatrix}";
    return latex;
  };

  vectorToLatex = (vector, isVariable = false) => {
    let latex = "\\begin{Bmatrix}";
    if (isVariable) {
      latex += vector.join(' \\\\ ');
    } else {
      latex += vector.map(val => format(val, { notation: 'fixed', precision: 2 })).join(' \\\\ ');
    }
    latex += "\\end{Bmatrix}";
    return latex;
  };
  
  handleOrderChange = (event) => {
    const order = parseInt(event.target.value);
    if (order >= 1 && order <= 7) { 
      this.setState({ polynomialOrder: order });
    }
  }

  clearForm = () => {
    super.clearForm();
    this.setState({ polynomialOrder: 1 });
  }

  //@ Override: Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { points, targetX, polynomialOrder } = this.state;
    const numPoints = points.map(p => ({ x: parseFloat(p.x), y: parseFloat(p.y) }));
    const numTargetX = parseFloat(targetX);
    const m = parseInt(polynomialOrder);
    if (numPoints.some(p => isNaN(p.x) || isNaN(p.y)) || isNaN(numTargetX)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    if (numPoints.length <= m) {
      alert(`Polynomial regression of order ${m} requires at least ${m + 1} data points.`);
      return;
    }
    const X = numPoints.map(p => {
        let row = [];
        for (let i = 0; i <= m; i++) {
            row.push(Math.pow(p.x, i));
        }
        return row;
    });
    const y = numPoints.map(p => p.y);
    const XT = transpose(X);
    const XTX = multiply(XT, X);
    const XTy = multiply(XT, y);
    try {
        const coeffs = lusolve(XTX, XTy).flat();
        let yExtrapolated = 0;
        for (let i = 0; i <= m; i++) {
            yExtrapolated += coeffs[i] * Math.pow(numTargetX, i);
        }
        //* แก้ไข: ส่ง XTX และ XTy ไปให้ generateSolutionSteps
        const solutionSteps = this.generateSolutionSteps(coeffs, numTargetX, yExtrapolated, XTX, XTy);
        const { plotData, plotLayout } = this.prepareGraphData(numPoints, coeffs, numTargetX, yExtrapolated);
        this.setState({ solution: solutionSteps, plotData, plotLayout });
    } catch (error) {
        alert("Could not solve the system of equations. The matrix may be singular.");
        console.error("Regression calculation error:", error);
        this.setState({ solution: null });
    }
  }

  //@ Override: สร้าง Method สำหรับสร้างขั้นตอนการแสดงผล (เขียนใหม่ทั้งหมด)
  generateSolutionSteps = (coeffs, targetX, result, XTX, XTy) => {
    let steps = [];
    const m = coeffs.length - 1;
    //* 1. แสดงสมการพหุนามทั่วไป
    let generalPolynomial = 'f(x) = a_0';
    for (let i = 1; i <= m; i++) {
        generalPolynomial += ` + a_{${i}}x`;
        if (i > 1) generalPolynomial += `^${i}`;
    }
    steps.push(`\\( ${generalPolynomial} \\)`);
    //* 2. แสดงระบบสมการเชิงเส้น
    const aVars = Array.from({ length: m + 1 }, (_, i) => `a_{${i}}`);
    const matrixSystem = `\\( ${this.matrixToLatex(XTX)} ${this.vectorToLatex(aVars, true)} = ${this.vectorToLatex(XTy)} \\)`;
    steps.push(matrixSystem);
    //* 3. แสดงสมการที่คำนวณได้
    let finalPolynomial = `f(x) = ${format(coeffs[0], {notation: 'fixed', precision: 4})}`;
    for (let i = 1; i <= m; i++) {
        const coeff = coeffs[i];
        finalPolynomial += (coeff >= 0 ? ' + ' : ' - ');
        finalPolynomial += `${format(Math.abs(coeff), {notation: 'fixed', precision: 4})}x`;
        if (i > 1) {
            finalPolynomial += `^${i}`;
        }
    }
    steps.push(`\\( ${finalPolynomial} \\)`);
    //* 4. แสดงผลลัพธ์สุดท้าย
    steps.push(`\\( \\therefore f(${targetX}) = ${format(result, { precision: 14 })} \\)`);
    return steps;
  }

  //? โค้ดส่วนที่เหลือของคุณ (ไม่มีการเปลี่ยนแปลง)
  prepareGraphData = (points, coeffs, targetX, result) => {
    const allX = points.map(p => p.x).concat(targetX);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const buffer = (maxX - minX) * 0.2 || 1;
    const plotStart = minX - buffer;
    const plotEnd = maxX + buffer;
    const polynomialFunc = (x) => {
        let y = 0;
        for (let i = 0; i < coeffs.length; i++) {
            y += coeffs[i] * Math.pow(x, i);
        }
        return y;
    };
    const curvePoints = [];
    const step = (plotEnd - plotStart) / 200;
    for (let x = plotStart; x <= plotEnd; x += step) {
        curvePoints.push({ x: x, y: polynomialFunc(x) });
    }
    const plotData = [
        { //* trace1: f(x)
            x: curvePoints.map(p => p.x), y: curvePoints.map(p => p.y),
            type: 'scatter', mode: 'lines', name: 'Regression f(x)',
            line: { color: 'green' }
        },
        { //* trace2: Data Points
            x: points.map(p => p.x), y: points.map(p => p.y),
            type: 'scatter', mode: 'markers', name: 'Data Points',
            marker: { color: 'red', size: 8 }
        },
        { //* trace3: Predicted Point
            x: [targetX], y: [result],
            type: 'scatter', mode: 'markers', name: 'Predicted Point',
            marker: { color: 'green', size: 8}
        }
    ];
    const plotLayout = {
        title: 'Polynomial Regression Plot',
        xaxis: { title: 'x' }, yaxis: { title: 'y' },
        hovermode: 'closest', dragmode: 'pan', showlegend: true
    };
    return { plotData, plotLayout };
  }

  renderForm = () => {
    const { points, targetX, polynomialOrder } = this.state;
    return (
      <Form>
        <Row className="justify-content-center mb-3">
          <Col md={6}>
            <Form.Label>Number of Data Points:</Form.Label>
            <InputGroup>
              <Button variant="outline-danger" onClick={() => this.removePoint(points.length - 1)} disabled={points.length <= 2}>-</Button>
              <Form.Control type="text" readOnly value={points.length} className="text-center" />
              <Button variant="outline-success" onClick={this.addPoint} disabled={points.length >= 10}>+</Button>
            </InputGroup>
          </Col>
        </Row>
        <div className="container mb-2 mx-3">Input x and y</div>
        {points.map((point, index) => (
            <Row key={index} className="justify-content-center align-items-center mb-2 mx-3">
                <Col>
                    <Form.Control type="number" placeholder={`x${index}`} value={point.x} onChange={e => this.handlePointChange(e, index, 'x')} />
                </Col>
                <Col>
                    <Form.Control type="number" placeholder={`y${index}`} value={point.y} onChange={e => this.handlePointChange(e, index, 'y')} />
                </Col>
            </Row>
        ))}
        <Row className="justify-content-center mt-4">
            <Col md={4}>
                <Form.Group>
                    <Form.Label>Polynomial Order (m):</Form.Label>
                    <Form.Control type="number" value={polynomialOrder} onChange={this.handleOrderChange} min="1" max="7" placeholder="Enter order m"/>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label>Enter X to Extrapolate:</Form.Label>
                    <Form.Control type="number" value={targetX} onChange={this.handleTargetXChange} />
                </Form.Group>
            </Col>
        </Row>
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="mx-2 w-25">Calculate</Button>
          <Button variant="success" onClick={this.fillForm} className="mx-2">Fill Form</Button>
          <Button variant="danger" onClick={this.clearForm} className="mx-2">Clear Form</Button>
        </div>
      </Form>
    );
  }
  
  renderGraph = () => {
    if (!this.state.plotData) {
        return null;
    }
    return (
        <div className="mt-4">
            <h4 className="mb-3">Graph</h4>
            <Plot
                data={this.state.plotData}
                layout={this.state.plotLayout}
                config={{ scrollZoom: true, displaylogo: false, responsive: true, }}
                style={{ width: "100%", height: "500px" }}
            />
        </div>
    );
  }

  render() {
    return (
      <Card className="container p-3 mt-4 shadow-sm">
        {this.nameOfSolution()}
        {this.renderForm()}
        {this.state.solution && (
          <div className="mt-4">
            <h4 className="mb-3">Solution</h4>
            <Card className="p-3 bg-light">
              {this.renderSolution()}
            </Card>
          </div>
        )}
        {this.renderGraph()}
      </Card>
    );
  }
}

export default SimpleRegression;
