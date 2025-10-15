import React from "react";
import { Card, Form, Button, Row, Col, InputGroup } from "react-bootstrap"; //* เพิ่ม InputGroup
import Plot from "react-plotly.js";
import { MathJax } from "better-react-mathjax";
import { format, lusolve, multiply, transpose } from "mathjs";

class MultipleLinearRegression extends React.Component {
  //@ Constructor
  constructor(props) {
    super(props);
    //* ตั้งค่า State เริ่มต้นสำหรับ Multiple Regression
    const initialVars = 2;
    const initialPoints = 4;
    this.state = {
      title: "Multiple Linear Regression",
      numPoints: initialPoints,
      numVars: initialVars, //* k (Number of Independent variables)
      points: this.createEmptyPoints(initialPoints, initialVars), //* Data points [ {x: [x1, x2,...], y: ''}, ... ]
      targetX: Array(initialVars).fill(''), //* ค่า x ที่ต้องการทำนาย
      solution: null,
      plotData: null,
      plotLayout: null,
    };
  }

  //? Helper Functions for State Management
  createEmptyPoints = (numPoints, numVars) => {
    return Array(numPoints).fill(0).map(() => ({
      x: Array(numVars).fill(''),
      y: ''
    }));
  };
  
  //? Helper functions for LaTeX
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

  //? Event Handlers
  addPoint = () => {
    const newSize = this.state.numPoints + 1;
    if (newSize <= 20) { //* จำกัดจำนวนจุดสูงสุด
        this.setState({
            numPoints: newSize,
            points: this.createEmptyPoints(newSize, this.state.numVars),
            solution: null
        });
    }
  }

  removePoint = () => {
      const newSize = this.state.numPoints - 1;
      //* จำนวนจุดต้องมากกว่าจำนวนตัวแปร และอย่างน้อย 2 จุด
      if (newSize > this.state.numVars) {
           this.setState({
              numPoints: newSize,
              points: this.createEmptyPoints(newSize, this.state.numVars),
              solution: null
          });
      } else {
          alert(`At least ${this.state.numVars + 1} points are required for this calculation.`);
      }
  }

  handleNumVarsChange = (event) => {
    const newSize = parseInt(event.target.value);
    if (newSize > 0 && newSize <= 7) {
      this.setState({
        numVars: newSize,
        points: this.createEmptyPoints(this.state.numPoints, newSize),
        targetX: Array(newSize).fill(''),
        solution: null
      });
    }
  }
  
  handlePointChange = (event, pointIndex, varIndex) => {
    const newPoints = [...this.state.points];
    if (varIndex === 'y') {
      newPoints[pointIndex].y = event.target.value;
    } else {
      newPoints[pointIndex].x[varIndex] = event.target.value;
    }
    this.setState({ points: newPoints });
  }

  handleTargetXChange = (event, varIndex) => {
    const newTargetX = [...this.state.targetX];
    newTargetX[varIndex] = event.target.value;
    this.setState({ targetX: newTargetX });
  }

  //? Control Buttons Logic
  fillForm = () => {
    const { numPoints, numVars } = this.state;
    //* สร้างสัมประสิทธิ์สุ่มเพื่อสร้างข้อมูลที่มีแนวโน้ม
    const trueCoeffs = [Math.random() * 10, ...Array(numVars).fill(0).map(() => (Math.random() * 5) - 2.5)];
    const newPoints = [];
    for (let i = 0; i < numPoints; i++) {
        const x_row = Array(numVars).fill(0).map(() => Math.floor(Math.random() * 20));
        let y_val = trueCoeffs[0];
        for (let j = 0; j < numVars; j++) {
            y_val += trueCoeffs[j+1] * x_row[j];
        }
        y_val += (Math.random() - 0.5) * 5; //* Add noise
        newPoints.push({ x: x_row, y: y_val.toFixed(2) });
    }
    //* สร้างค่าสุ่มสำหรับเวกเตอร์ X ที่ต้องการทำนาย
    const newTargetX = Array(numVars).fill(0).map(() => Math.floor(Math.random() * 25));
    //* อัปเดต State ทั้ง points และ targetX
    this.setState({ points: newPoints, targetX: newTargetX });
  }

  clearForm = () => {
    const { numPoints, numVars } = this.state;
    this.setState({
      points: this.createEmptyPoints(numPoints, numVars),
      targetX: Array(numVars).fill(''),
      solution: null,
      plotData: null
    });
  }

  //? Calculation and Solution Generation
  calculateMethod = () => {
    const { points, targetX, numVars } = this.state;
    const numTargetX = targetX.map(val => parseFloat(val));
    const numPoints = points.map(p => ({
        x: p.x.map(val => parseFloat(val)),
        y: parseFloat(p.y)
    }));
    //* ตรวจสอบ Input
    if (numPoints.some(p => p.x.some(isNaN) || isNaN(p.y)) || numTargetX.some(isNaN)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }
    if (points.length <= numVars) {
      alert(`Multiple regression with ${numVars} variables requires at least ${numVars + 1} data points.`);
      return;
    }
    //* สร้างระบบสมการ (X'X)a = X'y
    const X = numPoints.map(p => [1, ...p.x]); //* Design Matrix
    const y = numPoints.map(p => p.y);
    const XT = transpose(X);
    const XTX = multiply(XT, X);
    const XTy = multiply(XT, y);
    try {
        const coeffs = lusolve(XTX, XTy).flat(); //* Vector a
        let yPredicted = coeffs[0]; //* a₀
        for (let i = 0; i < numVars; i++) {
            yPredicted += coeffs[i+1] * numTargetX[i];
        }
        const solutionSteps = this.generateSolutionSteps(coeffs, numTargetX, yPredicted, XTX, XTy);
        const { plotData, plotLayout } = this.prepareGraphData(numPoints, coeffs);
        this.setState({ solution: solutionSteps, plotData, plotLayout });
    } catch (error) {
        alert("Could not solve the system of equations. The matrix may be singular. Check your data points.");
        this.setState({ solution: null });
    }
  }

  generateSolutionSteps = (coeffs, targetX, result, XTX, XTy) => {
    let steps = [];
    const k = coeffs.length - 1;
    let generalPoly = 'f(x_1, ..., x_k) = a_0';
    for (let i = 1; i <= k; i++) generalPoly += ` + a_{${i}}x_{${i}}`;
    steps.push(`\\( ${generalPoly} \\)`);
    const aVars = Array.from({ length: k + 1 }, (_, i) => `a_{${i}}`);
    steps.push(`\\( ${this.matrixToLatex(XTX)} ${this.vectorToLatex(aVars, true)} = ${this.vectorToLatex(XTy)} \\)`);
    let finalPoly = `f(x) = ${format(coeffs[0], {notation: 'fixed', precision: 4})}`;
    for (let i = 1; i <= k; i++) {
        finalPoly += (coeffs[i] >= 0 ? ' + ' : ' - ') + `${format(Math.abs(coeffs[i]), {notation: 'fixed', precision: 4})}x_{${i}}`;
    }
    steps.push(`\\( ${finalPoly} \\)`);
    const targetXString = targetX.join(', ');
    steps.push(`\\( \\therefore f(${targetXString}) = ${format(result, { precision: 14 })} \\)`);
    return steps;
  }

  prepareGraphData = (points, coeffs) => {
    const actualY = points.map(p => p.y);
    const predictedY = points.map(p => {
        let y = coeffs[0];
        for (let i = 0; i < this.state.numVars; i++) {
            y += coeffs[i+1] * p.x[i];
        }
        return y;
    });
    const allValues = actualY.concat(predictedY);
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const buffer = (maxVal - minVal) * 0.1 || 1;
    const plotData = [
        { //* trace1: Data Points
          x: actualY,
          y: predictedY, 
          type: 'scatter', 
          mode: 'markers', 
          name: 'Data Points', 
          marker: {color: 'red'} 
        },
        { //* trace2: f(x1, x2, ...) 
          x: [minVal - buffer, maxVal + buffer], 
          y: [minVal - buffer, maxVal + buffer],
          type: 'scatter', 
          mode: 'lines', 
          name: 'y = x line', 
          line: {color: 'green',} 
        }
    ];
    const plotLayout = {
      title: 'Predicted Y vs. Actual Y',
      dragmode: "pan",
      hovermode: "closest",
      xaxis: { title: 'Actual Y', range: [minVal - buffer, maxVal + buffer] },
      yaxis: { title: 'Predicted Y', range: [minVal - buffer, maxVal + buffer] },
      showlegend: true
    };
    return { plotData, plotLayout };
  }

  //? Render Methods
  nameOfSolution = () => { return <h2 className="mb-3 text-center">{this.state.title}</h2>; };

  renderForm = () => {
    const { numPoints, numVars, points, targetX } = this.state;
    const pointArray = Array.from(Array(numPoints).keys());
    const varArray = Array.from(Array(numVars).keys());
    return (
      <Form>
        <Row className="justify-content-center mb-3">
          <Col md={4}>
            <Form.Label>Number of Data Points (n):</Form.Label>
            <InputGroup>
              <Button variant="outline-danger" onClick={this.removePoint}>-</Button>
              <Form.Control type="text" readOnly value={numPoints} className="text-center" />
              <Button variant="outline-success" onClick={this.addPoint}>+</Button>
            </InputGroup>
          </Col>
          <Col md={4}><Form.Group><Form.Label>Number of Variables (k):</Form.Label><Form.Control type="number" value={numVars} onChange={this.handleNumVarsChange} min="1" max="7"/></Form.Group></Col>
        </Row>
        <div style={{overflowX: 'auto', paddingBottom: '15px'}}>
          <Row className="text-center" style={{minWidth: `${150 + (numVars * 90)}px`}}>
            <Col xs={2} className="mb-1">y</Col>
            {varArray.map(k => <Col key={k} className="mb-1">x{k+1}</Col>)}
          </Row>
          {pointArray.map(i => (
            <Row key={i} className="mb-2 align-items-center" style={{minWidth: `${150 + (numVars * 90)}px`}}>
              <Col xs={2}><Form.Control type="number" value={points[i].y} onChange={e => this.handlePointChange(e, i, 'y')} placeholder={`y${i+1}`} /></Col>
              {varArray.map(k => (
                <Col key={k}><Form.Control type="number" value={points[i].x[k]} onChange={e => this.handlePointChange(e, i, k)} placeholder={`x${i+1},${k+1}`} /></Col>
              ))}
            </Row>
          ))}
        </div>
        <Row className="justify-content-center mt-4">
          <Col md={8}>
            <Form.Label>Enter X Vector to Extrapolate:</Form.Label>
            <Row>
              {varArray.map(k => (
                <Col key={k}><Form.Control type="number" value={targetX[k]} onChange={e => this.handleTargetXChange(e, k)} placeholder={`x${k+1}`} /></Col>
              ))}
            </Row>
          </Col>
        </Row>
        <div className="d-flex justify-content-center mt-3">
          <Button variant="primary" onClick={this.calculateMethod} className="w-25">Calculate</Button>
          <Button variant="success" onClick={this.fillForm} className="mx-2">Fill Form</Button>
          <Button variant="danger" onClick={this.clearForm}>Clear Form</Button>
        </div>
      </Form>
    );
  };
  
  renderSolution = () => {
    return (
      <div className="d-flex justify-content-center">
        <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
          {this.state.solution.map((step, index) => (
            <div key={index} className="mb-3">
              <MathJax>{step}</MathJax>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
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
                config={{ scrollZoom: true, displaylogo: false, responsive: true }}
                style={{ width: "100%", height: "500px" }}
            />
        </div>
    );
  };

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
  };
}

export default MultipleLinearRegression;

