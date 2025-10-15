import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
//* useNavigate → hook ของ React Router เอาไว้เปลี่ยนหน้าโดยไม่ reload
import { Form, Row, Col } from "react-bootstrap";

function Home() {
  const navigate = useNavigate(); //* navigate("/path") → React Router จะพาไปยัง path ที่ระบุ
  //@ Mapping: Problem → Solution → Path
  const problemOptions = { //* problemOptions เป็น object ซ้อน object 
    "Root of Equation": { //* key = Problem , value = object({Solution:Path})
      "Graphical Method": "/root-of-equation/graphical",
      "Bisection Method": "/root-of-equation/bisection",
      "False Position Method": "/root-of-equation/false-position",
      "One Point Iteration Method": "/root-of-equation/one-point-iteration",
      "Newton Raphson Method": "/root-of-equation/newton-raphson",
      "Secant Method": "/root-of-equation/secant",
    },
    "Linear Algebra": {
      "Cramer's Rule": "/linear-algebra/cramers-rule",
      "Gauss Elimination Method": "/linear-algebra/gauss-elimination",
      "Gauss Jordan Method": "/linear-algebra/gauss-jordan",
      "Matrix Inversion": "/linear-algebra/matrix-inversion",
      "LU Decomposition Method": "/linear-algebra/lu-decomposition",
      "Cholesky Decomposition Method": "/linear-algebra/cholesky-decomposition",
      "Jacobi Iteration Method": "/linear-algebra/jacobi-iteration",
      "Gauss Seidel Method": "/linear-algebra/gauss-seidel",
      "Conjugate Gradient Method": "/linear-algebra/conjugate-gradient",
    },
    "Interpolation": {
      "Newton Divided Difference": "/interpolation/newton-divided-difference",
      "Lagrange Interpolation": "/interpolation/lagrange",
      "Spline Interpolation": "/interpolation/spline",
    },
    "Extrapolation": {
      "Simple Regression": "/extrapolation/simple-regression",
      "Multiple Linear Regression": "/extrapolation/multiple-linear-regression",
    },
    "Integration": {
      "Single Trapezoidal Rule": "/integration/single-trapezoidal-rule",
      "Composite Trapezoidal Rule": "/integration/composite-trapezoidal-rule",
      "Single Simpson's Rule": "/integration/single-simpsons-rule",
      "Composite Simpson's Rule": "/integration/composite-simpsons-rule",
    },
    "Differentiation": {
      "Forward Divided Difference": "/differentiation/forward-divided-difference",
      "Backward Divided Difference": "/differentiation/backward-divided-difference",
      "Central Divided Difference": "/differentiation/central-divided-difference",
    },
    "Test ⚙️": {
      "Test 1": "/test/test-1",
      "Test 2": "/test/test-2",
      "Test 3": "/test/test-3",
    },
  };

  //@ State เริ่มต้นเป็นค่าว่าง
  const [problem, setProblem] = useState(""); //* problem → เก็บว่าผู้ใช้เลือก "Root of Equation" หรืออย่างอื่น
  const [solution, setSolution] = useState(""); //* solution → เก็บว่าผู้ใช้เลือก "Bisection Method" หรืออะไร
  //@ ฟังก์ชัน handleProblemChange
  const handleProblemChange = (value) => {
    setProblem(value); //* เวลาเลือก Problem → อัปเดตค่า problem
    setSolution(""); //* แล้ว reset solution ให้กลับเป็นค่าว่าง เพราะวิธีแก้ต้องเลือกใหม่ทุกครั้ง
  };
  //@ ฟังก์ชัน handleSolutionChange
  const handleSolutionChange = (value) => {
    setSolution(value); //* เวลาเลือก Solution → อัปเดตค่า solution
    if (problem && value) {
      navigate(problemOptions[problem][value]); 
      //* ถ้าเลือกทั้ง problem และ solution ครบ → เรียก navigate() ไปยัง path
    }
  };
  return (
    <div className="container mt-3">
      <Row className="align-items-center">
        <Col md={4}>
          {/*⚪ Dropdown Type of Problem */}
          <Form.Label>Type of Problem:</Form.Label>
          <Form.Select
            value={problem}
            onChange={(e) => handleProblemChange(e.target.value)}
          >
            <option value="" disabled hidden>
              Select...
            </option>
            {Object.keys(problemOptions).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          {/*⚪ Dropdown Solution */}
          <Form.Label>Solution:</Form.Label>
          <Form.Select
            value={solution}
            onChange={(e) => handleSolutionChange(e.target.value)}
            disabled={!problem} //* ยังเลือกไม่ได้ถ้าไม่ได้เลือก problem ก่อน
          >
            <option value="" disabled hidden>
              Select...
            </option>
            {problem &&
              Object.keys(problemOptions[problem]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </Form.Select>
        </Col>
      </Row>
    </div>
  );
}

export default Home;
