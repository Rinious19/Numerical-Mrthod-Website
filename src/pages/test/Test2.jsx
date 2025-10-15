import React from "react";
import { equalText, evaluate, stefanBoltzmannDependencies, xor } from "mathjs";
import { fetchRandomPreset } from "../../PresetManager";
import { MathJax } from "better-react-mathjax";
import { Button,Row,Col,Container,Form,Card,Table } from "react-bootstrap";
import Plot from "react-plotly.js";

class Test2 extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            fx: '',
            xStart: '',
            xEnd: '',
            tol: '',
            maxIterations: 100,
            iterations: [],
            precisionForError: 2,
            plotData: null,
            plotLayout: null,
            title: "False Position Method",
            collectionName: "rootOfEquationPresets",
        }
    }
    f = (x) => {
        try{
            return evaluate(this.state.fx,{x}) 
        }catch(error){
            console.error("Error is "+error)
        }
    }
    fillForm = async () => {
        const presetData = await fetchRandomPreset(this.state.collectionName)
        if(presetData){
            this.setState({fx: presetData.fx,xStart: presetData.xStart,xEnd: presetData.xEnd,tol: presetData.tol})
            console.error("Fill Form Success")
        }
    }
    clearForm = () => {
        this.setState({fx: '',xStart: '',xEnd: '',tol: ''})
        console.error("Clear Form Success")
    }
    calculateMethod = () => {
        let xStart = Number(this.state.xStart)
        let xEnd = Number(this.state.xEnd)
        let tol = Number(this.state.tol)
        let error = 1
        let xOld = xStart
        let iter = 0
        let iterations = []
        if(this.f(xStart) * this.f(xEnd) > 0){
            alert("f(xStart) and f(xEnd) should has opposite sign")
            this.setState({iterations: [],plotData: null})
            return
        }
        do{
            let fxl = this.f(xStart)
            let fxr = this.f(xEnd)
            let xNew = (fxr*xStart - fxl*xEnd)/(fxr - fxl)
            let fxNew = this.f(xNew)
            error = Math.abs((xNew - xOld)/xNew) * 100
            iterations.push({iter: ++iter,xk: xNew,fxk: fxNew,error})
            if(fxNew * fxl > 0) xStart = xNew
            else xEnd = xNew
            xOld = xNew 
        }while(error > tol)
        this.prepareGraphData(iterations)
    }
    prepareGraphData = (iterations) => {
        let xStart = Number(this.state.xStart)
        let xEnd = Number(this.state.xEnd)
        let sampleGraphFx = []
        let stepGraph = (xEnd - xStart) / 200
        for(let x=xStart;x<=xEnd;x+=stepGraph){
            sampleGraphFx.push({x,y: this.f(x)})
        }
        const plotData = [
            { //* f(x) 
                x: sampleGraphFx.map(row => row.x),
                y: sampleGraphFx.map(row => row.y),
                type: 'scatter',
                mode: 'lines',
                name: 'f(x)',
                line: {color: 'green'}
            },
            { //* x 
                x: iterations.map(row => row.xk),
                y: iterations.map(row => row.fxk),
                type: 'scatter',
                mode: 'markers',
                name: 'x',
                marker: {color: 'red'}
            }
        ]
        const plotLayout = {
            title: this.state.title,
            xaxis: {title: 'x'},
            yaxis: {title: 'f(x)'},
            dragmode: 'pan',
            hovermode: 'closest',
            responsive: true,
        }
        const precisionForError = this.state.tol.toString().split('.')[1]?.length || 2
        this.setState({iterations,precisionForError,plotData,plotLayout})
    }
    nameOfSolution = () => {
        return <h2 className="text-center mb-4">{this.state.title}</h2>
    }
    renderForm = () => {
        const {xStart,xEnd,tol,fx} = this.state
        const isButtonDisabled = fx === '' || xStart === '' || xEnd === '' || tol === '' 
        return (
            <Form>
                <Row className="mb-2">
                    <Col md={7}>
                        <Form.Group>
                            <Form.Label>f(x)</Form.Label>
                            <Form.Control
                                type="text"
                                value={fx}
                                onChange={e => this.setState({fx: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={5}>
                        <div className="bg-light p-3 h-100 fs-5 d-flex justify-content-start align-items-center">
                            <MathJax inline>{"\\(f(x) \\quad=\\quad\\)"}</MathJax>
                            <MathJax inline>{`\\(${fx}\\)`}</MathJax>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Group>
                            <Form.Label>x start</Form.Label>
                            <Form.Control
                                type="number"
                                value={xStart}
                                onChange={e => this.setState({xStart: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>x end</Form.Label>
                            <Form.Control
                                type="number"
                                value={xEnd}
                                onChange={e => this.setState({xEnd: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group className="mb-2">
                    <Form.Label>tolerance(%)</Form.Label>
                    <Form.Control
                        type="number"
                        value={tol}
                        onChange={e => this.setState({tol: e.target.value})}
                    />
                </Form.Group>
                <div className="d-flex justify-content-center mt-3 mb-3">
                    <Button onClick={this.calculateMethod} disabled={isButtonDisabled} className="mx-2 w-25" variant="primary">calculate</Button>
                    <Button onClick={this.fillForm} className="mx-2" variant="success">fill form</Button>
                    <Button onClick={this.clearForm} className="mx-2" variant="danger">clear form</Button>
                </div>
            </Form>
        )
    }
    renderTable = () => {
        return (
            <Table hover borderless>
                <thead className="table-light">
                    <tr>
                        <th>iter</th>
                        <th>x<sub>k</sub></th>
                        <th>f(x<sub>k</sub>)</th>
                        <th>error</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.iterations.map((row) => (
                        <tr key={row.iter}>
                            <td>{row.iter}</td>
                            <td>{row.xk.toFixed(6)}</td>
                            <td>{row.fxk.toFixed(6)}</td>
                            <td>{row.error.toFixed(this.state.precisionForError)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        )
    }
    renderGraph = () => {
        if(!this.state.plotData){
            return null
        }
        return (
            <Container>
                <h4>Graph</h4>
                <Plot
                    data={this.state.plotData}
                    layout={this.state.plotLayout}
                    config={{
                        responsive: true,
                        scrollZoom: true,
                        displaylogo: true
                    }}
                    style={{width: '100%',height: '100vh'}}
                />
            </Container>
        )
    }
    render(){
        return (
            <Card className="container p-5 shadow-sm">
                {this.nameOfSolution()}
                {this.renderForm()}
                {this.state.iterations.length > 0 &&
                    <div className="mb-4">
                        <div className="table-responsive">
                            {this.renderTable()}
                        </div>
                    </div>
                }
                {this.renderGraph()}
            </Card>
        )
    }
}

export default Test2