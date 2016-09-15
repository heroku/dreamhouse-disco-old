import React, { Component } from 'react';
import { connect } from 'react-redux';

import logo from '../../images/disco-chat-logo.png';

function select(store) {
  return { account: store.account.account };
}


class App extends Component {
  render() {
    console.log(this.props);
    return (
      <div className='main login'>
        <div className='login-container'>
          <div className='logo'>
            <img src={ logo } alt='Smiley face'/>
            <h1>Dreamhouse<strong>Disco</strong></h1>
          </div>
          <p className='tagline'>Your Party Built this Playlist</p>
          <a href='/api/auth' className='button'>Get started!</a>
        </div>
      </div>
    )
  }
}

export default connect(select)(App)
