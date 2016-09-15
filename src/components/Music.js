import _ from 'lodash';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player'

import Track from './Track';

import logo from '../../images/disco-chat-logo.png'
import placeholder from '../../images/placeholder.png'

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
              <h2>Now playing</h2>
              <div className='track now-playing'>
                <img src={ placeholder } alt='Album Title'/>
                <span className='track-title'>Leave the Biker</span>
                <span className='track-artist'>Fountains of Wayne</span>
              </div>
              <h2>Up next</h2>
              <div className='track on-deck'>
                <img src={ placeholder } alt='Album Title'/>
                <span className='track-title'>Tiny Cities Made of Ashes</span>
                <span className='track-artist'>Modest Mouse</span>
              </div>
            </div>
          </div>
          <div className='playlist'>
            <ol className='tracks'>
              <li className='track'>
                <span className='track-title'>Greatest Song in the World</span>
                <span className='track-artist'>Tenacious D</span>
                <span className='track-time'>3:45</span>
              </li>
              <li className='track'>
                <span className='track-title'>Greatest Song in the World</span>
                <span className='track-artist'>Tenacious D</span>
                <span className='track-time'>3:45</span>
              </li>
              <li className='track'>
                <span className='track-title'>This Is a Very Very Long Song Title That Will Wrap to the Next Line</span>
                <span className='track-artist'>Tenacious D</span>
                <span className='track-time'>3:45</span>
              </li>
              <li className='track new'>
                <span className='track-title'>Greatest Song in the World</span>
                <span className='track-artist'>Tenacious D</span>
                <span className='track-time'>3:45</span>
              </li>
            </ol>
            <footer>
              <div className='track-count'><span>4</span> tracks</div>
              <div className='sms-number'>
                <span>text a track to </span>
                {/* TODO: replace hard-coded alt-number */}
                <strong>{ formatNumber(number) }</strong>
                <span className='alt-number'>693 - 4726</span>
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
