import JacobiIterationMethod from './JacobiIterationMethod'; //* 1. Import Jacobi มาเป็นคลาสแม่

//? 2. สร้างคลาส GaussSeidelMethod โดยสืบทอดจาก JacobiIterationMethod
class GaussSeidelMethod extends JacobiIterationMethod {
  //@ Constructor
  constructor(props) {
    super(props);
    //* Override ค่า title ใน State
    this.state.title = "Gauss Seidel Iteration Method";
  }

  //? Override Calculation Method
  //@ 3. Override เฉพาะ Method หลักสำหรับการคำนวณ
  calculateMethod = () => {
    const { matrixA, matrixB, initialX, matrixSize, tol, maxIterations } = this.state;
    //* แปลง Input ทั้งหมดเป็นตัวเลข
    const numA = matrixA.map(row => row.map(val => parseFloat(val)));
    const numB = matrixB.map(val => parseFloat(val));
    const xOld = initialX.map(val => parseFloat(val));
    //* ตรวจสอบ Input
    if (numA.some(row => row.some(isNaN)) || numB.some(isNaN)) {
        alert("Please enter valid numbers in all matrix fields.");
        return;
    }
     if (xOld.some(isNaN)){
        alert("Please enter valid numbers in the initial guess vector.");
        return;
    }
    let iter = 0;
    let error = Infinity;
    const iterationsData = [];
    //* เพิ่ม Initial Guess เป็น Iteration 0
    iterationsData.push({
      iter: 0,
      x: xOld,
      error: xOld.map(() => Infinity)
    });
    let xCurrent = [...xOld];
    while (error > tol && iter < maxIterations) {
      const xNew = [...xCurrent]; //* เริ่มต้น xNew ด้วยค่าจากรอบที่แล้ว
      for (let i = 0; i < matrixSize; i++) {
        let sum = 0;
        for (let j = 0; j < matrixSize; j++) {
          if (i !== j) {
            //?-- Logic ของ Gauss-Seidel--
            //* ใช้ค่า x ที่เพิ่งอัปเดตในรอบเดียวกัน (xNew) มาคำนวณต่อทันที
            sum += numA[i][j] * xNew[j];
          }
        }
        if (Math.abs(numA[i][i]) < 1e-9) {
          alert(`Diagonal element at [${i+1},${i+1}] is zero. Method fails.`);
          this.setState({ solution: null });
          return;
        }
        //* อัปเดตค่า xNew[i] เพื่อให้ Loop j รอบถัดไปนำไปใช้ได้ทันที
        xNew[i] = (numB[i] - sum) / numA[i][i];
      }
      //* ส่วนของการคำนวณ Error จะเหมือนกับ Jacobi ทุกประการ
      const errorArray = xNew.map((val, i) => {
        if (Math.abs(val) < 1e-9) return Infinity;
        return Math.abs((val - xCurrent[i]) / val) * 100;
      });
      error = Math.max(...errorArray.filter(e => isFinite(e)));
      if (!isFinite(error)) error = Infinity;
      iter++;
      iterationsData.push({ iter, x: xNew, error: errorArray });
      xCurrent = [...xNew]; 
    }
    this.setState({ solution: iterationsData });
  };

  //? 4. ไม่ต้องเขียนเมธอดอื่นๆ ที่เหลือ
  //? เพราะจะได้รับการสืบทอดมาจาก JacobiIterationMethod โดยอัตโนมัติ
  //? (เช่น renderForm, renderSolution, handleSizeChange, fillForm, clearForm)
}

export default GaussSeidelMethod;

