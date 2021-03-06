/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import {
  List,
  Checkbox,
  ListItem,
  Button,
  TextField,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Select,
  Divider,
  Popover
} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { makeStyles } from '@material-ui/core/styles'
import { useSelector, useDispatch } from 'react-redux'
import { setControlLine, setControlBlock, setResultTitle, setResultGraph, setResultText } from '../../redux/actions/index'
import { GenerateNetList, GenerateNodeList, GenerateCompList } from './Helper/ToolbarTools'
import SimulationScreen from './SimulationScreen'

import api from '../../utils/Api'

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: '90px'
  },
  pages: {
    margin: theme.spacing(0, 1)
  },
  propertiesBox: {
    width: '100%'
  },
  simulationOptions: {
    margin: '0px',
    padding: '0px',
    width: '100%'
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular
  }
}))

export default function SimulationProperties () {
  const netfile = useSelector(state => state.netlistReducer)
  const isSimRes = useSelector(state => state.simulationReducer.isSimRes)
  const dispatch = useDispatch()
  const classes = useStyles()
  const [nodeList, setNodeList] = useState([])
  const [componentsList, setComponentsList] = useState([])
  const [dcSweepcontrolLine, setDcSweepControlLine] = useState({
    parameter: '',
    sweepType: 'Linear',
    start: '',
    stop: '',
    step: '',
    parameter2: '',
    start2: '',
    stop2: '',
    step2: ''
  })
  const [transientAnalysisControlLine, setTransientAnalysisControlLine] = useState({
    start: '',
    stop: '',
    step: '',
    skipInitial: 'No'
  })

  const [acAnalysisControlLine, setAcAnalysisControlLine] = useState({
    input: '',
    start: '',
    stop: '',
    pointsBydecade: ''
  })

  const [controlBlockParam, setControlBlockParam] = useState('')

  const handleControlBlockParam = (evt) => {
    setControlBlockParam(evt.target.value)
  }

  const onDcSweepTabExpand = () => {
    try {
      setComponentsList(['', ...GenerateCompList()])
    } catch (err) {
      setComponentsList([])
      alert('Circuit not complete. Please Check Connectons.')
    }
  }

  const handleDcSweepControlLine = (evt) => {
    const value = evt.target.value

    setDcSweepControlLine({
      ...dcSweepcontrolLine,
      [evt.target.id]: value
    })
  }

  const handleTransientAnalysisControlLine = (evt) => {
    const value = evt.target.value

    setTransientAnalysisControlLine({
      ...transientAnalysisControlLine,
      [evt.target.id]: value
    })
  }

  const handleAcAnalysisControlLine = (evt) => {
    const value = evt.target.value

    setAcAnalysisControlLine({
      ...acAnalysisControlLine,
      [evt.target.id]: value
    })
  }

  const [simulateOpen, setSimulateOpen] = React.useState(false)

  const handlesimulateOpen = () => {
    setSimulateOpen(true)
  }

  const handleSimulateClose = () => {
    setSimulateOpen(false)
  }

  // Prepare Netlist to file
  const prepareNetlist = (netlist) => {
    var titleA = netfile.title.split(' ')[1]
    var myblob = new Blob([netlist], {
      type: 'text/plain'
    })
    var file = new File([myblob], `${titleA}.cir`, { type: 'text/plain', lastModified: Date.now() })
    // console.log(file)
    sendNetlist(file)
  }

  function sendNetlist (file) {
    netlistConfig(file)
      .then((response) => {
        const res = response.data
        const getUrl = 'simulation/status/'.concat(res.details.task_id)
        console.log(getUrl)
        simulationResult(getUrl)
      })
      .catch(function (error) {
        console.log(error)
      })
  }

  // Upload the nelist
  function netlistConfig (file) {
    const formData = new FormData()
    formData.append('file', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return api.post('simulation/upload', formData, config)
  }

  // Get the simulation result with task_Id
  function simulationResult (url) {
    api
      .get(url)
      .then((res) => {
        if (res.data.state === 'PROGRESS' || res.data.state === 'PENDING') {
          setTimeout(simulationResult(url), 1000)
        } else {
          console.log(res.data)
          var temp = res.data.details.data
          if (res.data.details.graph === 'true') {
            var simResultGraph = {}
            simResultGraph.labels = temp[0].labels
            simResultGraph.x1 = temp[0].x
            simResultGraph.y11 = temp[0].y[0]
            simResultGraph.y21 = temp[0].y[1]
            console.log(simResultGraph)
            dispatch(setResultGraph(simResultGraph))
          } else {
            var simResultText = []
            for (var i = 0; i < temp.length; i++) {
              simResultText.push(temp[i][0] + ' ' + temp[i][1] + ' ' + temp[i][2] + '\n')
            }
            console.log(simResultText)
            dispatch(setResultText(simResultText))
          }
        }
      })
      .then((res) => { handlesimulateOpen() })
      .catch(function (error) {
        console.log(error)
      })
  }
  // const SecondaryParamaterForDcSweep = (props) => {
  //   const prefix = props.prefix
  //   if (prefix === 'R' || prefix === 'r') {
  //     return (
  //       <>
  //         <ListItem>
  //           <TextField id="start2" label="Start Resistance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.start2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>K</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="stop2" label="Stop Resistance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.stop2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>K</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="step2" label="Step Resistance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.step2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>K</span>
  //         </ListItem>
  //       </>
  //     )
  //   } else if (prefix === 'C' || prefix === 'c') {
  //     return (
  //       <>
  //         <ListItem>
  //           <TextField id="start2" label="Start Capacitance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.start2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>F</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="stop2" label="Stop Capacitance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.stop2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>F</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="step2" label="Step Capacitance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.step2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>F</span>
  //         </ListItem>
  //       </>
  //     )
  //   } else if (prefix === 'L' || prefix === 'l') {
  //     return (
  //       <>
  //         <ListItem>
  //           <TextField id="start2" label="Start Inductance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.start2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>H</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="stop2" label="Stop Inductance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.stop2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>H</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="step2" label="Step Inductance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.step2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>H</span>
  //         </ListItem>
  //       </>
  //     )
  //   } else if (prefix === 'V' || prefix === 'v') {
  //     return (
  //       <>
  //         <ListItem>
  //           <TextField id="start2" label="Start Voltage" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.start2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>V</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="stop2" label="Stop Voltage" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.stop2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>V</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="step2" label="Step InductVoltageance" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.step2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>V</span>
  //         </ListItem>
  //       </>
  //     )
  //   } else if (prefix === 'I' || prefix === 'i') {
  //     return (
  //       <>
  //         <ListItem>
  //           <TextField id="start2" label="Start Current" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.start2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>A</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="stop2" label="Stop Current" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.stop2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>A</span>
  //         </ListItem>
  //         <ListItem>
  //           <TextField id="step2" label="Step Current" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.step2}
  //             onChange={handleDcSweepControlLine}
  //           />
  //           <span style={{ marginLeft: '10px' }}>A</span>
  //         </ListItem>
  //       </>
  //     )
  //   } else {
  //     return (
  //       <>
  //         <ListItem>
  //           <TextField id="start2" label="Start Value" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.start2}
  //             onChange={handleDcSweepControlLine}
  //           />

  //         </ListItem>
  //         <ListItem>
  //           <TextField id="stop2" label="Stop Value" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.stop2}
  //             onChange={handleDcSweepControlLine}
  //           />

  //         </ListItem>
  //         <ListItem>
  //           <TextField id="step2" label="Step Value" size='small' variant="outlined"
  //             value={dcSweepcontrolLine.step2}
  //             onChange={handleDcSweepControlLine}
  //           />

  //         </ListItem>
  //       </>
  //     )
  //   }
  // }

  const startSimulate = (type) => {
    var compNetlist = GenerateNetList()
    var controlLine = ''
    var controlBlock = ''
    switch (type) {
      case 'DcSolver':
        // console.log('To be implemented')
        controlLine = '.op'
        dispatch(setResultTitle('DC Solver Output'))
        break
      case 'DcSweep':
        // console.log(dcSweepcontrolLine)
        controlLine = `.dc ${dcSweepcontrolLine.parameter} ${dcSweepcontrolLine.start} ${dcSweepcontrolLine.stop} ${dcSweepcontrolLine.step} ${dcSweepcontrolLine.parameter2} ${dcSweepcontrolLine.start2} ${dcSweepcontrolLine.stop2} ${dcSweepcontrolLine.step2}`
        dispatch(setResultTitle('DC Sweep Output'))
        break
      case 'Transient':
        // console.log(transientAnalysisControlLine)
        controlLine = `.tran ${transientAnalysisControlLine.step} ${transientAnalysisControlLine.stop} ${transientAnalysisControlLine.start}`
        dispatch(setResultTitle('Transient Analysis Output'))
        break
      case 'Ac':
        // console.log(acAnalysisControlLine)
        controlLine = `.ac dec ${acAnalysisControlLine.pointsBydecade} ${acAnalysisControlLine.start} ${acAnalysisControlLine.stop}`
        dispatch(setResultTitle('AC Analysis Output'))
        break
      default:
        break
    }
    let cblockline
    if (controlBlockParam.length <= 0) { cblockline = 'all' } else { cblockline = controlBlockParam }
    controlBlock = `\n.control \nrun \nprint ${cblockline} > data.txt \n.endc \n.end`
    // console.log(controlLine)

    dispatch(setControlLine(controlLine))
    dispatch(setControlBlock(controlBlock))
    // setTimeout(function () { }, 2000)

    var netlist = netfile.title + '\n' +
      netfile.model + '\n' +
      compNetlist + '\n' +
      controlLine + '\n' +
      controlBlock + '\n'

    prepareNetlist(netlist)

    // handlesimulateOpen()
  }

  // simulation properties add expression input box
  const [anchorEl, setAnchorEl] = React.useState(null)
  const handleAddExpressionClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleAddExpressionClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  return (
    <>
      <div className={classes.SimulationOptions}>
        <SimulationScreen open={simulateOpen} close={handleSimulateClose} />

        {/* Simulation modes list */}
        <List>

          {/* DC Solver */}
          <ListItem className={classes.simulationOptions} divider>
            <div className={classes.propertiesBox}>
              <ExpansionPanel>
                <ExpansionPanelSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography className={classes.heading}>DC Solver</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <form>
                    <List>
                      <ListItem>

                        <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
                         Add Expression
                        </Button>
                        <Popover
                          id={id}
                          open={open}
                          anchorEl={anchorEl}
                          onClose={handleAddExpressionClose}

                          anchorOrigin={{
                            vertical: 'center',
                            horizontal: 'left'
                          }}
                          transformOrigin={{
                            vertical: 'top',
                            horizontal: 'left'
                          }}
                        >

                          <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                            value={controlBlockParam}
                            onChange={handleControlBlockParam}
                          />

                        </Popover>

                      </ListItem>
                      <ListItem>
                        <Button size='small' variant="contained" color="primary"
                          onClick={(e) => { startSimulate('DcSolver') }}>
            Run dc solver
                        </Button>
                      </ListItem>
                    </List>
                  </form>
                </ExpansionPanelDetails>
              </ExpansionPanel>

            </div>
          </ListItem>

          {/* DC Sweep */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel onClick={onDcSweepTabExpand}>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>DC Sweep</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      {/* <TextField size='small' variant="outlined" id="parameter" label="Select Node"
                        value={dcSweepcontrolLine.parameter}
                        onChange={handleDcSweepControlLine}
                      /> */}

                      <TextField
                        style={{ width: '100%' }}
                        id="parameter"
                        size='small'
                        variant="outlined"
                        select
                        label="Select Component"
                        value={dcSweepcontrolLine.parameter}
                        onChange={handleDcSweepControlLine}
                        SelectProps={{
                          native: true
                        }}
                      >

                        {
                          componentsList.map((value, i) => {
                            if (value.charAt(0) === 'V' || value.charAt(0) === 'v' || value.charAt(0) === 'I' || value.charAt(0) === 'i' || value === '') {
                              return (<option key={i} value={value}>
                                {value}
                              </option>)
                            } else {
                              return null
                            }
                          })
                        }

                      </TextField>

                    </ListItem>

                    {/* <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="sweepType"
                        size='small'
                        variant="outlined"
                        select
                        label="Sweep Type"
                        value={dcSweepcontrolLine.sweepType}
                        onChange={handleDcSweepControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >
                        <option key="linear" value="linear">
                          Linear
                        </option>
                        <option key="decade" value="decade">
                          Decade
                        </option>
                      </TextField>
                    </ListItem> */}

                    <ListItem>
                      <TextField id="start" label="Start Voltage" size='small' variant="outlined"
                        value={dcSweepcontrolLine.start}
                        onChange={handleDcSweepControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>V</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Voltage" size='small' variant="outlined"
                        value={dcSweepcontrolLine.stop}
                        onChange={handleDcSweepControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>V</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="step" label="Step" size='small' variant="outlined"
                        value={dcSweepcontrolLine.step}
                        onChange={handleDcSweepControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>V</span>
                    </ListItem>

                    {/* <ListItem>
                      Second Parameter:
                      <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                    </ListItem> */}

                    {/* <ListItem>
                      <Button size='small' variant="contained">Add Expression</Button>
                    </ListItem> */}

                    {/* SECONDARY PARAMETER FOR SWEEP */}
                    <Divider/>
                    <ListItem>

                      <h4 style={{ marginLeft: '10px' }}>Secondary Parameters</h4>
                    </ListItem>

                    <ListItem>
                      {/* <TextField size='small' variant="outlined" id="parameter" label="Select Node"
                        value={dcSweepcontrolLine.parameter}
                        onChange={handleDcSweepControlLine}
                      /> */}

                      <TextField
                        style={{ width: '100%' }}
                        id="parameter2"
                        size='small'
                        variant="outlined"
                        select
                        label="Select Component"
                        value={dcSweepcontrolLine.parameter2}
                        onChange={handleDcSweepControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >

                        {
                          componentsList.map((value, i) => {
                            return <option key={i} value={value}>
                              {value}
                            </option>
                          })
                        }

                      </TextField>

                    </ListItem>

                    {/* <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="sweepType"
                        size='small'
                        variant="outlined"
                        select
                        label="Sweep Type"
                        value={dcSweepcontrolLine.sweepType}
                        onChange={handleDcSweepControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >
                        <option key="linear" value="linear">
                          Linear
                        </option>
                        <option key="decade" value="decade">
                          Decade
                        </option>
                      </TextField>
                    </ListItem> */}

                    <ListItem>
                      <TextField id="start2" label="Start Value" size='small' variant="outlined"
                        value={dcSweepcontrolLine.start2}
                        onChange={handleDcSweepControlLine}
                      />

                    </ListItem>
                    <ListItem>
                      <TextField id="stop2" label="Stop Value" size='small' variant="outlined"
                        value={dcSweepcontrolLine.stop2}
                        onChange={handleDcSweepControlLine}
                      />

                    </ListItem>
                    <ListItem>
                      <TextField id="step2" label="Step Value" size='small' variant="outlined"
                        value={dcSweepcontrolLine.step2}
                        onChange={handleDcSweepControlLine}
                      />

                    </ListItem>
                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
   Add Expression
                      </Button>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

                    </ListItem>

                    <ListItem>
                      <Button id="dcSweepSimulate" size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('DcSweep') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>

          {/* Transient Analysis */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>Transient Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    <ListItem>
                      <TextField id="start" label="Start Time" size='small' variant="outlined"
                        value={transientAnalysisControlLine.start}
                        onChange={handleTransientAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>S</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Time" size='small' variant="outlined"
                        value={transientAnalysisControlLine.stop}
                        onChange={handleTransientAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>S</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="step" label="Time Step" size='small' variant="outlined"
                        value={transientAnalysisControlLine.step}
                        onChange={handleTransientAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>S</span>
                    </ListItem>

                    {/* <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="skipInitial"
                        size='small'
                        variant="outlined"
                        select
                        label="Skip Initial"
                        value={transientAnalysisControlLine.skipInitial}
                        onChange={handleTransientAnalysisControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >
                        <option key="No" value="No">
                          No
                        </option>
                        <option key="Yes" value="Yes">
                          Yes
                        </option>
                      </TextField>
                    </ListItem> */}

                    {/* <ListItem>
                      Sweep Parameter:
                      <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                    </ListItem> */}

                    {/* <ListItem>
                      <Button size='small' variant="contained">Add Expression</Button>
                    </ListItem>
                     */}
                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
   Add Expression
                      </Button>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

                    </ListItem>
                    <ListItem>
                      <Button id="transientAnalysisSimulate" size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('Transient') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>

          {/* AC Analysis */}
          <ListItem className={classes.simulationOptions} divider>
            <ExpansionPanel>
              <ExpansionPanelSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography className={classes.heading}>AC Analysis</Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form className={classes.propertiesBox} noValidate autoComplete="off">
                  <List>
                    {/* <ListItem>
                      <TextField id="input" label="Input" size='small' variant="outlined"
                        value={acAnalysisControlLine.skipInitial}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem> */}

                    <ListItem>
                      <TextField
                        style={{ width: '100%' }}
                        id="input"
                        size='small'
                        variant="outlined"
                        select
                        label="Type"
                        value={acAnalysisControlLine.input}
                        onChange={handleAcAnalysisControlLine}
                        SelectProps={{
                          native: true
                        }}

                      >
                        <option key="linear" value="lin">
                          Linear
                        </option>
                        <option key="decade" value="dec">
                          Decade
                        </option>
                        <option key="octave" value="oct">
                          Octave
                        </option>
                      </TextField>
                    </ListItem>
                    <ListItem>
                      <TextField id="pointsBydecade" label="Points/ Decade" size='small' variant="outlined"
                        value={acAnalysisControlLine.pointsBydecade}
                        onChange={handleAcAnalysisControlLine}
                      />
                    </ListItem>
                    <ListItem>
                      <TextField id="start" label="Start Frequency" size='small' variant="outlined"
                        value={acAnalysisControlLine.start}
                        onChange={handleAcAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>Hz</span>
                    </ListItem>
                    <ListItem>
                      <TextField id="stop" label="Stop Frequency" size='small' variant="outlined"
                        value={acAnalysisControlLine.stop}
                        onChange={handleAcAnalysisControlLine}
                      />
                      <span style={{ marginLeft: '10px' }}>Hz</span>
                    </ListItem>

                    {/* <ListItem>
                      Sweep Parameter:
                      <Checkbox inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
                    </ListItem> */}

                    {/* <ListItem>
                      <Button size='small' variant="contained">Add Expression</Button>
                    </ListItem> */}
                    <ListItem>

                      <Button aria-describedby={id} variant="outlined" color="primary" size="small" onClick={handleAddExpressionClick}>
   Add Expression
                      </Button>
                      <Popover
                        id={id}
                        open={open}
                        anchorEl={anchorEl}
                        onClose={handleAddExpressionClose}

                        anchorOrigin={{
                          vertical: 'center',
                          horizontal: 'left'
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left'
                        }}
                      >

                        <TextField id="controlBlockParam" placeHolder="enter expression" size='large' variant="outlined"
                          value={controlBlockParam}
                          onChange={handleControlBlockParam}
                        />

                      </Popover>

                    </ListItem>

                    <ListItem>
                      <Button size='small' variant="contained" color="primary" onClick={(e) => { startSimulate('Ac') }}>
                        Simulate
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          </ListItem>

          <ListItem style={isSimRes ? {} : { display: 'none' }} onClick={handlesimulateOpen} >
            <Button size='small' variant="contained" color="primary" style={{ margin: '10px auto' }} onClick={handlesimulateOpen}>
              Simulation Result
            </Button>
          </ListItem>
        </List>
      </div>
    </>
  )
}
