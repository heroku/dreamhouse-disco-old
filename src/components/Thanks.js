import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';

import logo from '../../images/disco-chat-logo.png'


const select = function(store, ownProps) {
  return {}
}


class Thanks extends React.Component {


  render() {
    return (
      <div className='main thanks'>
        <p>Hello</p>

      </div>
    )
  }
}

export default connect(select, { })(Thanks);
