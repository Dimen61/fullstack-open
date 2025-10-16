const MsgStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
}

const Notification = ({ msg, msgStatus }) => {
  const successStyle = {
    color: 'green',
    background: 'lightgreymsgStatus',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  const errorStyle = {
    color: 'red',
    background: 'lightgrey',
    fontSize: 20,
    borderStyle: 'solid',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  if (msg === null) {
    return null
  }

  return (
    <div style={MsgStatus.SUCCESS === msgStatus ? successStyle : errorStyle}>
      {msg}
    </div>
  )
}

export { MsgStatus }
export default Notification
