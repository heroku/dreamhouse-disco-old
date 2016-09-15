import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player'

import Track from './Track';

import logo from '../../images/disco-chat-logo.png'

import { fetchPlaylist, nextTrack } from '../actions/musicActions'

const select = function(store, ownProps) {
  const { account, music } = store
  if (_.isEmpty(music.music)) {
    music.music.tracks = {}
    music.music.tracks.items = []
  }
  return {
    account: account.account,
    tracks: music.music.tracks.items,
    playlist: music.music,
    currentTrack: music.currentTrack,
    isPlaying: music.playing
  }
}


class Music extends Component {
  componentDidMount() {
    // TODO: replace hard-coded playlist with create or use existing playlist option:
    //  - select existing playlist from list
    //  - create new playlist
    this.props.fetchPlaylist('1WCoOeyBzRcWQfcFaJObFZ')
    this.timer = setInterval(() => this.props.fetchPlaylist('1WCoOeyBzRcWQfcFaJObFZ'), 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {

    let tracks = _.map(_.take(this.props.tracks, 4), (track) => {
      return <Track
        key={ track.track.id }
        track={ track.track }
      />
    })

    const { number } = this.props.account

    function formatNumber(n) {
      return `+1 (${n.substr(0, 3)}) ${n.substr(3, 2)} - ${n.substr(5,5)}`
    }


    return (
      <div className='main container'>

        <header>
          <a href="#" className="logo">
            <img src={ logo } alt="Smiley face"/>
            <aside>
              <h1>Dreamhouse<strong>Disco</strong></h1>
              <p>Your Party Built this Playlist</p>
            </aside>
          </a>
          <div className="sms-number">
            <h3>Text a track to</h3>
            {/* TODO: replace hard-coded alt-number */}
            <span><strong>{ formatNumber(number) }</strong><div className="alt-number">693 - 4726</div></span>
          </div>
        </header>

        <div className="playlist"> { tracks } </div>
        {/* TODO: Clean-up ugly musicReducer code behind this */}
        <div className="player">
          <ReactPlayer
            url={ this.props.currentTrack }
            playing={ this.props.isPlaying }
            controls={ true }
            height={ 75 }
            onEnded={ () => this.props.nextTrack() }
          />
        </div>
      </div>
    )
  }
}

export default connect(select, { fetchPlaylist, nextTrack })(Music);
