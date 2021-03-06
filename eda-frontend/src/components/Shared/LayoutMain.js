import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(5, 3),
    backgroundColor: '#f4f6f8',
    height: '100vh',
    overflow: 'auto'
  }
}))

export default function LayoutMain ({ children }) {
  const classes = useStyles()

  return (
    <>
      {/* Display content of layout */}
      <main className={classes.content}>
        {children}
      </main>
    </>
  )
}

LayoutMain.propTypes = {
  children: PropTypes.array.isRequired
}
