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
    this.props.fetchPlaylist()
    this.timer = setInterval(() => this.props.fetchPlaylist(), 5000)
  }

  componentWillUnmount() {
    clearInterval(this.timer)
  }

  render() {
    let { displayNumber, number } = this.props.account
    if (!displayNumber || displayNumber === '' || displayNumber === undefined) displayNumber = number

    let nowPlayingTrack = this.props.tracks.length > 0 ? this.props.tracks[0] : null
    let upNextTrack = this.props.tracks.length > 1 ? this.props.tracks[1] : null

    let tracks = _.map(this.props.tracks.slice(2), (track) => {
      return <Track
        key={ track.track.id }
        track={ track.track }
      />
    })


    return (
      <div className='main demo'>

        <header>
          <a href='#' className='logo'>
            <img src={ logo } alt='Smiley face'/>
            <h1>Dreamhouse<strong>Disco</strong></h1>
          </a>
          <p className='byline'>a demo app running on <a href='https://www.heroku.com/' className='logo-heroku'>Heroku</a></p>
        </header>

        <div className='playlist-container'>
          <div className='player'>
            <div className='container'>
              { nowPlayingTrack &&
                <div>
                  <h2>Now playing</h2>
                  <div className='track now-playing'>
                    <img src={ nowPlayingTrack.track.album.images[0].url } alt={ nowPlayingTrack.track.album.name }/>
                    <span className='track-title'>{ nowPlayingTrack.track.name }</span>
                    <span className='track-artist'>{ nowPlayingTrack.track.artists[0].name }</span>
                  </div>
                </div>
              }
              { upNextTrack &&
                <div>
                  <h2>Up next</h2>
                  <div className='track on-deck'>
                    <img src={ upNextTrack.track.album.images[0].url } alt={ upNextTrack.track.album.name }/>
                    <span className='track-title'>{ upNextTrack.track.name }</span>
                    <span className='track-artist'>{ upNextTrack.track.artists[0].name }</span>
                  </div>
                </div>
              }
            </div>
          </div>
          <div className='playlist'>
            <ol className='tracks'>
              { tracks }
            </ol>
            <footer>
              <div className='track-count'><span>{ tracks.length }</span> tracks</div>
              <div className='sms-number'>
                <span>text a track to </span>
                <strong>{ displayNumber }</strong>
                <span className='alt-number'>{ number }</span>
              </div>
            </footer>
          </div>
        </div>

        {/*
        <div className='playlist-container'>
          // TODO: Clean-up ugly musicReducer code behind this
          <div className='player'>
            <ReactPlayer
              url={ this.props.currentTrack }
              playing={ this.props.isPlaying }
              controls={ true }
              height={ 75 }
              onEnded={ () => this.props.nextTrack() }
            />
          </div>
          <div className='playlist'> { tracks } </div>
        </div> */}
      </div>
    )
  }
}

export default connect(select, { fetchPlaylist, nextTrack })(Music);
