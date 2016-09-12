import React from 'react'

class Track extends React.Component {

  render() {
    const { track } = this.props
   // console.log(track.name, upNow, upNext)
    return (
      <article className="track-wrapper">
        <div className="track">
          <img className="cover-art" src={ track.album.images[0].url } alt="Album Art"/>
          <div className="details">
            <div className="name">{ track.name }</div>
            <div className="album">{ track.album.name }</div>
            <div className="artist"><span>by </span> { track.artists[0].name }</div>
          </div>
        </div>
        <aside>
          {/* <div>Now Playing</div> */}
          {/*  <div>5 Likes</div> */}
        </aside>
      </article>
    )
  }
}

export default Track
