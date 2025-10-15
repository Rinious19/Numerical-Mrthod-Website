import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import './App.css' //* ทุก Component สามารถเข้าถึง Style ที่ import มาใน Root Component ได้โดยตรง
import { MathJax, MathJaxContext } from "better-react-mathjax" //* ใช้แสดงผลสมการคณิตศาสตร์

import Home from './pages/Home'
import Navbar from './components/NavbarComponent'

import BisectionMethod from './pages/root-of-equation/BisectionMethod'
import FalsePositionMethod from './pages/root-of-equation/FalsePositionMethod'
import GraphicalMethod from './pages/root-of-equation/GraphicalMethod'
import OnePointIterationMethod from './pages/root-of-equation/OnePointIterationMethod'
import NewtonRaphsonMethod from './pages/root-of-equation/NewtonRaphsonMethod'
import SecantMethod from './pages/root-of-equation/SecantMethod'

import CramersRule from './pages/linear-algebra/CramersRule'
import GaussEliminationMethod from './pages/linear-algebra/GaussEliminationMethod'
import GaussJordanMethod from './pages/linear-algebra/GaussJordanMethod'
import MatrixInversion from './pages/linear-algebra/MatrixInversion'
import LUDecompositionMethod from './pages/linear-algebra/LUDecompositionMethod'
import CholeskyDecompositionMethod from './pages/linear-algebra/CholeskyDecompositionMethod'
import JacobiIterationMethod from './pages/linear-algebra/JacobiIterationMethod'
import GaussSeidelMethod from './pages/linear-algebra/GaussSeidelMethod'
import ConjugateGradientMethod from './pages/linear-algebra/ConjugateGradientMethod'

import NewtonDividedDifference from './pages/interpolation/NewtonDividedDifference'
import LagrangeInterpolation from './pages/interpolation/LagrangeInterpolation'
import SplineInterpolation from './pages/interpolation/SplineInterpolation'

import SimpleRegression from './pages/extrapolation/SimpleRegression'
import MultipleLinearRegression from './pages/extrapolation/MultipleLinearRegression'

import SingleTrapezoidalRule from './pages/integration/SingleTrapezoidalRule'
import CompositeTrapezoidalRule from './pages/integration/CompositeTrapezoidalRule'
import SingleSimpsonsRule from './pages/integration/SingleSimpsonsRule'
import CompositeSimpsonsRule from './pages/integration/CompositeSimpsonsRule'

import ForwardDividedDifference from './pages/differentiation/ForwardDividedDifference'
import BackwardDividedDifference from './pages/differentiation/BackwardDividedDifference'
import CentralDividedDifference from './pages/differentiation/CentralDividedDifference'

import Test1 from './pages/test/Test1'
import Test2 from './pages/test/Test2'
import Test3 from './pages/test/Test3'

function App() {
  return (
    <BrowserRouter>
      <MathJaxContext> 
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home />} /> 
          <Route path="/root-of-equation/bisection" element={<BisectionMethod />} />
          <Route path="/root-of-equation/false-position" element={<FalsePositionMethod />} />
          <Route path="/root-of-equation/graphical" element={<GraphicalMethod />} />
          <Route path="/root-of-equation/one-point-iteration" element={<OnePointIterationMethod />} />
          <Route path="/root-of-equation/newton-raphson" element={<NewtonRaphsonMethod />} />
          <Route path="/root-of-equation/secant" element={<SecantMethod />} />
          
          <Route path="/linear-algebra/cramers-rule" element={<CramersRule />} />
          <Route path="/linear-algebra/gauss-elimination" element={<GaussEliminationMethod />} />
          <Route path="/linear-algebra/gauss-jordan" element={<GaussJordanMethod />} />
          <Route path="/linear-algebra/matrix-inversion" element={<MatrixInversion />} />
          <Route path="/linear-algebra/lu-decomposition" element={<LUDecompositionMethod />} />
          <Route path="/linear-algebra/cholesky-decomposition" element={<CholeskyDecompositionMethod />} />
          <Route path="/linear-algebra/jacobi-iteration" element={<JacobiIterationMethod />} />
          <Route path="/linear-algebra/gauss-seidel" element={<GaussSeidelMethod />} />
          <Route path="/linear-algebra/conjugate-gradient" element={<ConjugateGradientMethod />} />

          <Route path="/interpolation/newton-divided-difference" element={<NewtonDividedDifference />} />
          <Route path="/interpolation/lagrange" element={<LagrangeInterpolation />} />
          <Route path="/interpolation/spline" element={<SplineInterpolation />} />

          <Route path="/extrapolation/simple-regression" element={<SimpleRegression />} />
          <Route path="/extrapolation/multiple-linear-regression" element={<MultipleLinearRegression />} />

          <Route path="/integration/single-trapezoidal-rule" element={<SingleTrapezoidalRule />} />
          <Route path="/integration/composite-trapezoidal-rule" element={<CompositeTrapezoidalRule />} />
          <Route path="/integration/single-simpsons-rule" element={<SingleSimpsonsRule />} />
          <Route path="/integration/composite-simpsons-rule" element={<CompositeSimpsonsRule />} />

          <Route path="/differentiation/forward-divided-difference" element={<ForwardDividedDifference />} />
          <Route path="/differentiation/backward-divided-difference" element={<BackwardDividedDifference />} />
          <Route path="/differentiation/central-divided-difference" element={<CentralDividedDifference />} />

          <Route path="/test/test-1" element={<Test1 />} />
          <Route path="/test/test-2" element={<Test2 />} />
          <Route path="/test/test-3" element={<Test3 />} />
        </Routes>
      </MathJaxContext>
    </BrowserRouter>
  )
}

export default App
