import React from "react";
import { Card,Form,Container,Col,Row,Button,Table } from "react-bootstrap";
import { evaluate,} from "mathjs";
import { MathJax } from "better-react-mathjax";
import { fetchRandomPreset } from "../../PresetManager";
import Plot from "react-plotly.js";

class Test1 extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            fx: '',
            xStart: '',
            xEnd: '',
            tol: '',
            precisionForError: 2,
            iterations: [],
            maxIterations: 100,
            plotData: null,
            plotLayout: null,
            title: 'Root of Equation Solver',
            collectionName: 'rootOfEquationPresets',
        }
    }
    f = (x) => {
        try{
            return evaluate(this.state.fx, {x})
        }catch(error){
            console.error("Error is "+error)
            return NaN
        }
    }
    calculateMethod = () => {
        alert("This method must be implemented in The Subclass.")
    }
    prepareGraphData = (iterations) => {
        let xStart = Number(this.state.xStart)
        let xEnd = Number(this.state.xEnd)
        let samplesGraphFx = []
        let grapStep = (xEnd - xStart) / 200
        for(let x=xStart;x<=xEnd;x+=grapStep){
            samplesGraphFx.push({x,y: this.f(x)})
        }
        let plotData = [
            { //* trace1: f(x)
                x: samplesGraphFx.map(el => el.x),
                y: samplesGraphFx.map(el => el.y),
                type: 'scatter',
                mode: 'lines',
                name: 'f(x)',
                line: {color: 'green'}
            },
            { //* trace2: xk 
                x: iterations.map(el => el.xk),
                y: iterations.map(el => el.fxk),
                type: 'scatter',
                mode: 'markers',
                name: 'x',
                marker: {color: 'red',size: 8}
            },
        ]
        let plotLayout = {
            title: this.state.title,
            xaxis: {title: 'x'},
            yaxis: {title: 'f(x)'},
            dragmode: 'pan',
            hovermode: 'closest',
            responsive: true,
        }
        let precisionForError = this.state.tol.toString().split('.')[1]?.length || 2
        this.setState({precisionForError,plotData,plotLayout,iterations})
    }
    fillForm = async () => {
        const presetData = await fetchRandomPreset(this.state.collectionName)
        if(presetData){
            this.setState({fx: presetData.fx,xStart: presetData.xStart,xEnd: presetData.xEnd,
                tol: presetData.tol})
            console.error("Fill Form Success")
        }
    }
    clearForm = () => {
        this.setState({fx: '',xStart: '',xEnd: '',tol: '',plotData: null,iterations: []})
        console.log("Clear Form Success")
    }
    nameOfSolution = () => {
        return <h2 className="mb-4 text-center">{this.state.title}</h2>
    }
    renderForm = () => {
        const {fx,xStart,xEnd,tol} = this.state
        let isButtonDisabled = fx === '' || xEnd === '' || xStart === '' || tol === ''
        return (
            <Form>
                <Row className="mb-2">
                    <Col md={7}>
                        <Form.Group className="mb-1">
                            <Form.Label>f(x)</Form.Label>
                            <Form.Control
                                type="text"
                                value={fx}
                                onChange={e => this.setState({fx: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col className="mb-1" md={5}>
                        <div className="border h-100 justify-content-start p-3 align-items-center rounded bg-light d-flex fs-5">
                            <MathJax inline>{"\\(f(x) \\quad=\\quad \\)"}</MathJax>
                            <MathJax inline>{`\\(${fx}\\)`}</MathJax>
                        </div>
                    </Col>
                </Row>
                <Row className="mb-2">
                    <Col>
                        <Form.Group className="mb-1">
                            <Form.Label>x start</Form.Label>
                            <Form.Control
                                type="number"
                                value={xStart}
                                onChange={e => this.setState({xStart: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-1">
                            <Form.Label>x end</Form.Label>
                            <Form.Control
                                type="number"
                                value={xEnd}
                                onChange={e => this.setState({xEnd: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Label>Error tolerance(%)</Form.Label>
                    <Form.Control
                        type="number"
                        value={tol}
                        onChange={e => this.setState({tol: e.target.value})}
                    />
                </Form.Group>
                <div className="d-flex justify-content-center">
                    <Button onClick={this.calculateMethod} disabled={isButtonDisabled} variant="primary" className="mx-2 w-25">calculate</Button>
                    <Button onClick={this.fillForm} variant="success" className="mx-2 ">fill form</Button>
                    <Button onClick={this.clearForm} variant="danger" className="mx-2 ">clear form</Button>
                </div>
            </Form>
        )
    }
    renderTable = () => {
        const {precisionForError} = this.state
        return (
            <Table hover boderless>
                <thead className="table-light">
                    <tr>
                        <th>iter</th>
                        <th>x<sub>k</sub></th>
                        <th>f(x<sub>k</sub>)</th>
                        <th>error(%)</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.iterations.map(row => ( 
                        <tr key={row.iter}>
                            <td>{row.iter}</td>
                            <td>{row.xk}</td>
                            <td>{row.fxk}</td>
                            <td>{row.error}</td>
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
            <Container fluid>
                <h4>Graph</h4>
                <Plot
                    data={this.state.plotData}
                    layout={this.state.plotLayout}
                    config={{
                        scrollZoom: true,
                        displaylogo: false,
                        responsive: true,
                    }}
                    style={{width: "100%",height: "100vh"}}
                />
            </Container>
        )
    }
    render(){
        return (
            <Card className="container shadow-sm p-3">
                {this.nameOfSolution()}
                {this.renderForm()}
                {this.state.iterations.length > 0 && 
                    <div className="mt-3">
                        <h4>Iterations</h4>
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
export default Test1 