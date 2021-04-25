import './App.css';

import React from 'react'

import Parser from 'rss-parser';
let parser = new Parser();

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stopped: false,
            includeDummies: false,
            alertItems: [],
            otherItems: [],
            lastUpdate: null,
            includeStandard: false
        };

        this.makeCall();
        setInterval(async () => {
            try {
                if (!this.state.stopped) {
                    await this.makeCall();
                }
            } catch (e) {
                console.error(e)
                alert('ERROR:' + e.message)
            }
        }, 31000);
    }

    async makeCall() {
        let gengo_url = 'http://localhost:5000/gengo-rss'

        let feed = await parser.parseURL(gengo_url),
        rawOutput = JSON.stringify(feed, null, 4);

        if (this.state.includeDummies) {
            feed.items.push({
                title: "(Pro) | job_240398 | 5 chars | Reward: US$0.24 | Japanese/English",
                link: "https://gengo.com/t/jobs/details/yyyy?referral=rss"
            })
            feed.items.push({
                title: "(Standard) | job_5555551 | 5 chars | Reward: US$0.24 | Japanese/English",
                link: "https://gengo.com/t/jobs/details/xxxx?referral=rss"
            })
        }

        feed.items.forEach(item => {
            const attribs = item.title.split(' | ');
            const ignored = !this.state.includeStandard && item.grade === '(Standard)'
            const old = Boolean(
                this.state.alertItems.concat(this.state.otherItems)
                .find(lastStateItem => lastStateItem.key === item.key));

            item.key = item.link
            item.grade = attribs[0]
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

    handleStopToggleClick() {
        let update = {
            stopped: !this.state.stopped
        }
        this.setState(Object.assign(this.state, update));
    }

    handleDummyToggleClick() {
        let update = {
            includeDummies: !this.state.includeDummies
        }
        this.setState(Object.assign(this.state, update));
    }

    render() {
        return (
            <div className="App">
                <h1 className="App-header">
                Gengo Reader
                </h1>

                <div>
                    <input
                        type="checkbox" checked={this.state.includeStandard}
                        onChange={() => this.handleStandardToggleClick()}
                    />
                    Include Standard Items
                </div>
                <div>
                    <input
                        type="checkbox" checked={this.state.stopped}
                        onChange={() => this.handleStopToggleClick()}
                    />
                    Stop Updates
                </div>
                <div>
                    <input
                        type="checkbox" checked={this.state.includeDummies}
                        onChange={() => this.handleDummyToggleClick()}
                    />
                    Include Dummies
                </div>

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
        if (this.state.stopped) {
            document.title = '*STOPPED* Gengo Reader'
        } else {
            document.title = 'Gengo Reader'
        }
        if (this.state.alertItems.length > 0) {
            alert('Hello')
        }
    }
}

export default App;
