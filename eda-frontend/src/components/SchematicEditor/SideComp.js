import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { List, ListItemText, Tooltip, Popover } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import './Helper/SchematicEditor.css'
import { AddComponent } from './Helper/SideBar.js'

const useStyles = makeStyles((theme) => ({
  popupInfo: {
    margin: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    border: '1px solid blue',
    borderRadius: '5px'
  }
}))

export default function SideComp ({ component }) {
  const classes = useStyles()
  const imageRef = React.createRef()

  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? 'simple-popover' : undefined

  useEffect(() => {
    AddComponent(component, imageRef.current)
  }, [imageRef, component])

  return (
    <div>

      <Tooltip title={component.full_name} arrow>
        <img ref={imageRef} className='compImage' src={'../' + component.svg_path} alt="Logo" aria-describedby={id} onClick={handleClick} />
      </Tooltip>

      <Popover
        id={id}
        open={open}
        className={classes.popup}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <List component="div" className={classes.popupInfo} disablePadding dense >
          <ListItemText>
            <b>Name:</b> {component.name}
          </ListItemText>
          <ListItemText>
            <b>Description:</b> {component.description}
          </ListItemText>

          <ListItemText>
            <b>Keywords:</b> {component.keyword}
          </ListItemText>

          <ListItemText>
            <b>Datasheet:</b> <a href={component.data_link}>{component.data_link}</a>
          </ListItemText>

          <ListItemText>
            <b>DMG:</b> {component.dmg}  <b> Part: </b> {component.part}
          </ListItemText>
        </List>
      </Popover>

    </div>
  )
}

SideComp.propTypes = {
  component: PropTypes.object.isRequired
}
