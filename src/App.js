import './App.css';

import React from 'react'

import Parser from 'rss-parser';
let parser = new Parser();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertItems: [],
      otherItems: [],
      lastUpdate: null,
      includeStandard: false
    };

    this.makeCall();
    setInterval(async () => {
      try {
        await this.makeCall();
      } catch (e) {
        console.error(e)
        alert('ERROR:' + e.message)
      }
    }, 31000);
  }

  async makeCall() {
    let gengo_url = 'https://gengo.com/rss/available_jobs/5881e505897f0f1b825d349ce6050019546e7587ac011847602998/'

    let feed = await parser.parseURL(gengo_url),
      rawOutput = JSON.stringify(feed, null, 4);

    /*feed.items.push({
      title: "(Pro) | job_240398 | 5 chars | Reward: US$0.24 | Japanese/English",
      link: "https://gengo.com/t/jobs/details/yyyy?referral=rss"
    })
    feed.items.push({
      title: "(Standard) | job_5555551 | 5 chars | Reward: US$0.24 | Japanese/English",
      link: "https://gengo.com/t/jobs/details/xxxx?referral=rss"
    })*/

    feed.items.forEach(item => {
        let attribs = item.title.split(' | ');

        item.key = item.link
        item.grade = attribs[0]

        let ignored = !this.state.includeStandard && item.grade === '(Standard)',
          old = Boolean(
            this.state.alertItems.concat(this.state.otherItems)
              .find(lastStateItem => lastStateItem.key === item.key));

        item.skipAlert = ignored || old;

    });

    let alertItems = feed.items.filter(item => !item.skipAlert),
      otherItems = feed.items.filter(item => item.skipAlert),
      update = {
        alertItems,
        otherItems,
        lastUpdate: new Date().toLocaleString(),
        rawOutput
    };

    this.setState(Object.assign(this.state, update));
  }

  handleStandardToggleClick() {
    let update = {
      includeStandard: !this.state.includeStandard
    }
    this.setState(Object.assign(this.state, update));
  }

  render() {
    return (
      <div className="App">
        <h1 className="App-header">
          Gengo Reader
        </h1>

        <input
          type="checkbox" checked={this.state.includeStandard}
          onChange={() => this.handleStandardToggleClick()}
        />
        Include Standard Items

        <div>
          <button onClick={() => this.makeCall()}> Force Update </button>
        </div>

        <hr/>

        <div>
          Last Update: {this.state.lastUpdate}
        </div>

        <h2>New Items</h2>
        {this.state.alertItems.map(x => (
          <div>
            <div>
              {x.title}
            </div>
            <a href={x.link} target="_blank" rel="noreferrer">
              {x.link}
            </a>
          </div>
        ))}

        <h2>Other Items</h2>
        {this.state.otherItems.map(x => (
          <div>
            <div>
              {x.title}
            </div>
            <a href={x.link} target="_blank" rel="noreferrer">
              {x.link}
            </a>
          </div>
        ))}

        {this.state.alertItems.length > 0 ? (
          <div id="audio-alert">
            <audio
              autoPlay
              controls
              src="/bluedanube.mp3">
                audio here
            </audio>
          </div>
        ) : null}

        <hr/>
        <div>{this.state.rawOutput}</div>
      </div>
    );
  }

  componentDidMount () {

  }

  componentDidUpdate () {
    if (this.state.alertItems.length > 0) {
      alert('Hello')
    }
  }
}

export default App;
