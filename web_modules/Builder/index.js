import React, { Component } from "react"
import ReactDOM from "react-dom"

import SVG from "SVG"
import Controls from "Controls"
import Result from "Controls/Result"

import "./styles"

class Builder extends Component {
    state = {
        w: 800,
        h: 600,
        grid: {
            show: true,
            snap: true,
            size: 50,
        },
        ctrl: false,
        points: [
            {
                x: 100,
                y: 300,
            },
        ],
        activePoint: 0,
        draggedPoint: false,
        draggedQuadratic: false,
        draggedCubic: false,
        closePath: false,
    }

    componentWillMount() {
        document.addEventListener("keydown", this.handleKeyDown, false)
        document.addEventListener("keyup", this.handleKeyUp, false)
    }

    componentWillUnmount() {
        document.removeEventListener("keydown")
        document.removeEventListener("keyup")
    }

    positiveNumber(n) {
        n = parseInt(n)

        if (isNaN(n) || n < 0) {
            n = 0
        }

        return n
    }

    setWidth = (e) => {
        let v = this.positiveNumber(e.target.value),
            min = 1

        if (v < min) {
            v = min
        }

        this.setState({ w: v })
    }

    setHeight = (e) => {
        let v = this.positiveNumber(e.target.value),
            min = 1

        if (v < min) {
            v = min
        }

        this.setState({ h: v })
    }

    setGridSize = (e) => {
        let grid = this.state.grid,
            v = this.positiveNumber(e.target.value),
            min = 1,
            max = Math.min(this.state.w, this.state.h)

        if (v < min) {
            v = min
        }

        if (v >= max) {
            v = max / 2
        }

        grid.size = v

        this.setState({ grid })
    }

    setGridSnap = (e) => {
        let grid = this.state.grid

        grid.snap = e.target.checked

        this.setState({ grid })
    }

    setGridShow = (e) => {
        let grid = this.state.grid

        grid.show = e.target.checked

        this.setState({ grid })
    }

    setClosePath = (e) => {
        this.setState({ closePath: e.target.checked })
    }

    getMouseCoords = (e) => {
        const rect = ReactDOM.findDOMNode(this.refs.svg).getBoundingClientRect()

        let x = Math.round(e.pageX - rect.left),
            y = Math.round(e.pageY - rect.top)

        if (this.state.grid.snap) {
            x = this.state.grid.size * Math.round(x / this.state.grid.size)
            y = this.state.grid.size * Math.round(y / this.state.grid.size)
        }

        return { x, y }
    }

    setPointType = (e) => {
        const points = this.state.points,
            active = this.state.activePoint

        // not the first point
        if (active !== 0) {
            let v = e.target.value

            switch (v) {
                case "l":
                    points[active] = {
                        x: points[active].x,
                        y: points[active].y,
                    }
                break

                case "q":
                    points[active] = {
                        x: points[active].x,
                        y: points[active].y,
                        q: {
                            x: (points[active].x + points[active - 1].x) / 2,
                            y: (points[active].y + points[active - 1].y) / 2,
                        },
                    }
                break

                case "c":
                    points[active] = {
                        x: points[active].x,
                        y: points[active].y,
                        c: [
                            {
                                x: (points[active].x + points[active - 1].x - 50) / 2,
                                y: (points[active].y + points[active - 1].y) / 2,
                            },
                            {
                                x: (points[active].x + points[active - 1].x + 50) / 2,
                                y: (points[active].y + points[active - 1].y) / 2,
                            },
                        ],
                    }
                break

                case "a":
                    points[active] = {
                        x: points[active].x,
                        y: points[active].y,
                        a: {
                            rx: 50,
                            ry: 50,
                            rot: 0,
                            laf: 1,
                            sf: 1,
                        },
                    }
                break

                default:
                    points[active] = {
                        x: 0,
                        y: 0,
                    }
                break
            }

            this.setState({ points })
        }
    }

    setPointPosition = (coord, e) => {
        let coords = this.state.points[this.state.activePoint],
            v = this.positiveNumber(e.target.value)

        if (coord === "x" && v > this.state.w) {
            v = this.state.w
        } else if (coord === "y" && v > this.state.h) {
            v = this.state.h
        }

        coords[coord] = v

        this.setPointCoords(coords)
    }

    setQuadraticPosition = (coord, e) => {
        let coords = this.state.points[this.state.activePoint].q,
            v = this.positiveNumber(e.target.value)

        if (coord === "x" && v > this.state.w) {
            v = this.state.w
        } else if (coord === "y" && v > this.state.h) {
            v = this.state.h
        }

        coords[coord] = v

        this.setQuadraticCoords(coords)
    }

    setCubicPosition = (coord, anchor, e) => {
        let coords = this.state.points[this.state.activePoint].c[anchor],
            v = this.positiveNumber(e.target.value)

        if (coord === "x" && v > this.state.w) {
            v = this.state.w
        } else if (coord === "y" && v > this.state.h) {
            v = this.state.h
        }

        coords[coord] = v

        this.setCubicCoords(coords, anchor)
    }

    setPointCoords = (coords) => {
        const points = this.state.points,
            active = this.state.activePoint

        points[active].x = coords.x
        points[active].y = coords.y

        this.setState({ points })
    }

    setQuadraticCoords = (coords) => {
        const points = this.state.points,
            active = this.state.activePoint

        points[active].q.x = coords.x
        points[active].q.y = coords.y

        this.setState({ points })
    }

    setArcParam = (param, e) => {
        const points = this.state.points,
            active = this.state.activePoint

        let v

        if (["laf", "sf"].indexOf(param) > -1) {
            v = e.target.checked ? 1 : 0
        } else {
            v = this.positiveNumber(e.target.value)
        }

        points[active].a[param] = v

        this.setState({ points })
    }

    setCubicCoords = (coords, anchor) => {
        const points = this.state.points,
            active = this.state.activePoint

        points[active].c[anchor].x = coords.x
        points[active].c[anchor].y = coords.y

        this.setState({ points })
    }

    setDraggedPoint = (e, index) => {
        e.preventDefault()

        if ( ! this.state.ctrl) {
            this.setState({
                activePoint: index,
                draggedPoint: true,
            })
        }
    }

    setDraggedQuadratic = (e, index) => {
        e.preventDefault()

        if ( ! this.state.ctrl) {
            this.setState({
                activePoint: index,
                draggedQuadratic: true,
            })
        }
    }

    setDraggedCubic = (e, index, anchor) => {
        e.preventDefault()

        if ( ! this.state.ctrl) {
            this.setState({
                activePoint: index,
                draggedCubic: anchor,
            })
        }
    }

    cancelDragging = (e) => {
        this.setState({
            draggedPoint: false,
            draggedQuadratic: false,
            draggedCubic: false,
        })
    }

    addPoint = (e) => {
        if (this.state.ctrl) {
            let coords = this.getMouseCoords(e),
                points = this.state.points

            points.push(coords)

            this.setState({
                points,
                activePoint: points.length - 1,
            })
        }
    }

    removeActivePoint = (e) => {
        let points = this.state.points,
            active = this.state.activePoint

        if (points.length > 1 && active !== 0) {
            points.splice(active, 1)

            this.setState({
                points,
                activePoint: points.length - 1,
            })
        }
    }

    handleMouseMove = (e) => {
        e.preventDefault()

        if ( ! this.state.ctrl) {
            if (this.state.draggedPoint) {
                this.setPointCoords(this.getMouseCoords(e))
            } else if (this.state.draggedQuadratic) {
                this.setQuadraticCoords(this.getMouseCoords(e))
            } else if (this.state.draggedCubic !== false) {
                this.setCubicCoords(
                    this.getMouseCoords(e),
                    this.state.draggedCubic
                )
            }
        }
    }

    handleKeyDown = (e) => {
        if (e.ctrlKey) {
            this.setState({ ctrl: true })
        }
    }

    handleKeyUp = (e) => {
        if ( ! e.ctrlKey) {
            this.setState({ ctrl: false })
        }
    }

    generatePath() {
        let { points, closePath } = this.state,
            d = ""

        points.forEach((p, i) => {
            if (i === 0) {
                // first point
                d += "M "
            } else if (p.q) {
                // quadratic
                d += `Q ${ p.q.x } ${ p.q.y } `
            } else if (p.c) {
                // cubic
                d += `C ${ p.c[0].x } ${ p.c[0].y } ${ p.c[1].x } ${ p.c[1].y } `
            } else if (p.a) {
                // arc
                d += `A ${ p.a.rx } ${ p.a.ry } ${ p.a.rot } ${ p.a.laf } ${ p.a.sf } `
            } else {
                d += "L "
            }

            d += `${ p.x } ${ p.y } `
        })

        if (closePath) {
            d += "Z"
        }

        return d
    }

    reset = (e) => {
        let w = this.state.w,
            h = this.state.h

        this.setState({
            points: [
                {
                    x: w / 2,
                    y: h / 2,
                },
            ],
            activePoint: 0,
        })
    }

    render() {
        return (
            <div
                className="ad-Builder"
                onMouseUp={ this.cancelDragging }>
                <div className="ad-Builder-main">
                    <div className="ad-Builder-svg">
                        <SVG
                            ref="svg"
                            path={ this.generatePath() }
                            { ...this.state }
                            addPoint={ this.addPoint }
                            setDraggedPoint={ this.setDraggedPoint }
                            setDraggedQuadratic={ this.setDraggedQuadratic }
                            setDraggedCubic={ this.setDraggedCubic }
                            handleMouseMove={ this.handleMouseMove } />
                    </div>
                </div>

                <div className="ad-Builder-controls">
                    <Controls
                        { ...this.state }
                        reset={ this.reset }
                        removeActivePoint={ this.removeActivePoint }
                        setPointPosition={ this.setPointPosition }
                        setQuadraticPosition={ this.setQuadraticPosition }
                        setCubicPosition={ this.setCubicPosition }
                        setArcParam={ this.setArcParam }
                        setPointType={ this.setPointType }
                        setWidth={ this.setWidth }
                        setHeight={ this.setHeight }
                        setGridSize={ this.setGridSize }
                        setGridSnap={ this.setGridSnap }
                        setGridShow={ this.setGridShow }
                        setClosePath={ this.setClosePath } />

                    <Result path={ this.generatePath() } />
                </div>
            </div>
        )
    }
}

export default Builder