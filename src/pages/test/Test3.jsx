import React from "react";
import { fetchRandomPreset } from "../../PresetManager";
import { MathJax } from "better-react-mathjax";
import { Card,Row,Col,Form,Button, Container } from "react-bootstrap";
import { evaluate, gravitationConstantDependencies, polynomialRoot, smaller } from "mathjs";
import Plot from "react-plotly.js";

class Test3 extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            fx: '',
            upperBound: '',
            lowerBound: '',
            segments: '',
            solutions: null,
            title: 'Composite Simpsons Rule',
            collectionName: 'integrationPresets',
            plotData: null,
            plotLayout: null,
        }
    }
    f = (x) => {
        try{
            return evaluate(this.state.fx,{x})
        }catch(error){
            console.log("Error is "+error)
            return NaN
        }
    }

    calculateMethod = () => {
        if(this.state.fx === '' || this.state.upperBound === '')
                return
        let a = Number(this.state.lowerBound)
        let b = Number(this.state.upperBound)
        let n = Number(this.state.segments)
        let h = (b - a)/(2*n)
        let sumEven = 0, sumOdd = 0
        let fa = this.f(a), fb = this.f(b)
        let pointData = []
        pointData.push({x:a,y:this.f(a)})
        for(let i=1;i<2*n;i++){
            let x = (a + i*h)
            pointData.push({x,y: this.f(x)})
            if(i%2==0) sumEven += this.f(a + i*h) 
            if(i%2==1) sumOdd += this.f(a + i*h) 
        }
        pointData.push({x:b,y:this.f(b)})
        let I = (h/3)*(fa + fb + 4*sumOdd + 2*sumOdd)
        let solutions = []
        solutions.push(`\\(1. Formula\\)`)
        solutions.push(`\\(I \\approx \\frac{h}{3}[f(x_0) + f(x_n) + 4\\sum_{i=1,3,5,...}^{n-1}{f(x_i)} +2\\sum_{i=2,4,6,...}^{n-2}{f(x_i)}]\\)`)
        solutions.push(`\\(h = \\frac{b-a}{2n}\\)`)
        solutions.push(`\\(2. Substitution\\)`)
        solutions.push(`\\(I \\approx \\frac{${h}}{3}[${fa} + ${fb} + 4${sumOdd}] + 2${sumEven}\\)`)
        solutions.push(`\\(3. Result\\)`)
        solutions.push(`\\(I \\approx ${I}\\)`)
        this.setState({solutions})
        console.log("End")
        this.prepareGraphData(pointData,n)
    }

    prepareGraphData = (pointData,n) => {
        console.log("prepareGraphData Call")
        let a = Number(this.state.lowerBound)
        let b = Number(this.state.upperBound)
        let buffer = (b - a) * 0.1
        let plotStart = a - buffer
        let plotEnd = b + buffer
        let samplesFx = [];
        let graphStep = (b - a) / 200;
        for (let x=plotStart; x<=plotEnd; x+=graphStep) {
            samplesFx.push({x:x,y:this.f(x) });
        }
        let trapezoid_shapes = []
        for (let i = 0; i < n; i++) {
            const x0 = pointData[i].x;
            const y0 = pointData[i].y;
            const x1 = pointData[i+1].x;
            const y1 = pointData[i+1].y;
            const path = `M ${x0},0 L ${x0},${y0} L ${x1},${y1} L ${x1},0 Z`;
            trapezoid_shapes.push({
                type: 'path',
                path: path,
                fillcolor: 'rgba(255, 140, 0, 0.4)',
                line: {width: 0}
            });
        }
        console.log(samplesFx)
        const plotData = [
            {
                x: samplesFx.map((i) => (i.x)),
                y: samplesFx.map((i) => (i.y)),
                type: 'scatter',
                mode: 'lines',
                name: 'f(x)',
                line: {color: 'blue'},
            },
            {
                x: pointData.map(i => i.x),
                y: pointData.map(i => i.y),
                type: 'scatter',
                mode: 'markers',
                name: 'x',
                marker: {color: 'red'},
            },
        ]
        console.log(plotData)
        const plotLayout = {
            title: "Composite Simpson Rule",
            xaxis: {title: 'x'},
            yaxis: {title: 'f(x)'},
            dragmode: 'pan',
            hovermode: 'closest',
            responsive: true,
            shapes: trapezoid_shapes
        }
        this.setState({plotData,plotLayout})
    }

    fillForm = async () => {
        const presetData = await fetchRandomPreset(this.state.collectionName)
        if(presetData){
            this.setState({fx: presetData.fx,lowerBound: presetData.lowerBound,upperBound: presetData.upperBound,segments: presetData.segments})
            console.error("Fill Form Success")
        }
    }
    clearForm = () => {
        this.setState({fx: '',upperBound: '',lowerBound: '',segments: '',solutions: null,plotData: null})
        console.error("Clear Form Success")
    }

    nameOfSolutions = () => {
        return <h4 className="text-center mb-4">{this.state.title}</h4>
    }

    renderForm = () => {
        const {upperBound,lowerBound,segments,fx} = this.state
        return (
            <Form>
                <Form.Group className="mb-2">
                    <Form.Label>f(x)</Form.Label>  
                    <Form.Control
                        type="text"
                        value={fx}
                        onChange={e => this.setState({fx: e.target.value})}
                    />
                </Form.Group>
                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>a</Form.Label>  
                            <Form.Control
                                type="number"
                                value={upperBound}
                                onChange={e => this.setState({upperBound: a.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>b</Form.Label>  
                            <Form.Control
                                type="text"
                                value={lowerBound}
                                onChange={e => this.setState({lowerBound: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>n</Form.Label>  
                            <Form.Control
                                type="text"
                                value={segments}
                                onChange={e => this.setState({fx: segments.target.value})}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <div className="d-flex justify-content-center">
                    <Button className="mx-2 w-25" variant="primary" onClick={this.calculateMethod}>calculate</Button>
                    <Button className="mx-2" variant="success" onClick={this.fillForm}>fill form</Button>
                    <Button className="mx-2" variant="danger" onClick={this.clearForm}>clear form</Button>
                </div>
            </Form>
        )
    }

    renderSolutions = () => {
        return (
            <Card className="container">
                {this.state.solutions.map((step,index) => (
                    <div key={index}>
                        <MathJax inline>{step}</MathJax>
                    </div>
                ))}
            </Card>
        )
    }

    renderGraph = () =>{
        if(!this.state.plotData){
            return null
        }
        return (
            <Container className="mt-3">
                <h4>Graph</h4>
                <Plot
                    data={this.state.plotData}
                    layout={this.state.plotLayout}
                    config={{
                        responsive: true,
                        scrollZoom: true,
                        displaylogo: false,
                    }}
                    style={{width: '100%',height: '100vh'}}
                />
            </Container>
        )
    }

    render(){
        return (
            <Card className="container p-5 shadow-sm">
                {this.nameOfSolutions()}
                {this.renderForm()}
                {this.state.solutions && (
                    <div>
                        <h4>Solutions</h4>
                        <div>
                            {this.renderSolutions()}
                        </div>
                    </div>
                )}
                {this.renderGraph()}
            </Card>
        )
    }
}

export default Test3