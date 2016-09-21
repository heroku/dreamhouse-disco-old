import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { RIEInput } from 'riek'

import { getSetup, setSetup } from '../actions/setupActions'

function select(store, ownProps) {
  const setup = store.setup.setup
  return {
    setup
  }
}

class Setup extends Component {
  componentWillMount() {
    this.props.getSetup()
  }

  onBlur(newValue) {
    this.props.setSetup(newValue)
  }

  render() {
    return (
      <div className="setup">
        <h1>Verify or input the following values</h1>
        <br/>
        <div className="input-element">
          <span>Playlist URI: </span>
          <span className="value">{this.props.setup.playlistPrependText}
            <RIEInput
              value={this.props.setup.playlistId || '-----'}
              change={this.onBlur.bind(this)}
              propName="playlistId"
              className={true ? "editable" : ""}
              classLoading="loading"
              classInvalid="invalid" />
          </span>
          <span> The last piece of the Spotify Playlist URI from which to play (In Spotify app, right-click on playlist -> Copy Spotify URI)</span>
        </div>

        <div className="input-element">
          <span>Number: </span>
          <span className="value">
            <RIEInput
              value={this.props.setup.number || '-----'}
              change={this.onBlur.bind(this)}
              propName="number"
              className={true ? "editable" : ""}
              classLoading="loading"
              classInvalid="invalid" />
          </span>
          <span> The number to text tracks to</span>
        </div>

        <div className="input-element">
          <span>Display Number: </span>
          <span className="value">
          <RIEInput
            value={this.props.setup.displayNumber || '-----'}
            change={this.onBlur.bind(this)}
            propName="displayNumber"
            className={true ? "editable" : ""}
            classLoading="loading"
            classInvalid="invalid" />
          </span>
          <span> An optional 'stylized' version of the number to text tracks to</span>
        </div>

        <br/>
        <Link to="/">Listen to some tunes!</Link>
      </div>
    )
  }
}

export default connect(select, { getSetup, setSetup, Link })(Setup);
