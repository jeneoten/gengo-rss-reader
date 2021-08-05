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
            items: [],
            lastUpdate: null,
            includeAllTypes: false,
            minimumPay: 0,
            useBrowserAlert: false,
        };
    }

    async componentWillMount() {
        // do not put this in constructor because it runs twice in dev mode
        setInterval(async () => {
            if (!this.state.stopped) {
                await this.makeCall();
            }
        }, 31000);
    }

    async makeCall() {
        try {
            let feed;

            if (!this.state.includeDummies) {
                let gengo_url = 'http://localhost:5000/gengo-rss'
                feed = await parser.parseURL(gengo_url)
            } else {
                feed = {items: []}
                feed.items.push({
                    title: "(Pro) | job_240398 | 5 chars | Reward: US$1.24 | Japanese/English",
                    link: "https://gengo.com/t/jobs/details/yyyy?referral=rss"
                })
                feed.items.push({
                    title: "(Standard) | job_5555551 | 5 chars | Reward: US$0.24 | Japanese/English",
                    link: "https://gengo.com/t/jobs/details/xxxx?referral=rss"
                })
            }

            let rawOutput = JSON.stringify(feed, null, 4);

            feed.items.forEach(item => {
                const attribs = item.title.split(' | ');
                const grade = attribs[0]
                const id = attribs[1]
                const pay = parseFloat(
                    attribs[3].substring(attribs[3].indexOf('US$') + 3))

                const ignored = pay < this.state.minimumPay
                    || (!this.state.includeAllTypes && grade !== '(Pro)');

                const old = Boolean(
                    this.state.items.find(lastStateItem => lastStateItem.key === id));

                item.pay = pay
                item.key = id
                item.grade = attribs[0]
                item.skipAlert = ignored || old;
            });

            let update = {
                items: feed.items,
                lastUpdate: new Date().toLocaleString(),
                rawOutput
            };

            this.setState(Object.assign(this.state, update));
        } catch (e) {
            console.error(e)
            // var typeWriter = new Audio("/bluedanube.mp3");
            // typeWriter.play()
            // alert('ERROR:' + e.message)
            let update = {
                rawOutput: e.message
            };
            this.setState(Object.assign(this.state, update));
        }
    }

    handleStandardToggleClick() {
        let update = {
            includeAllTypes: !this.state.includeAllTypes
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

    handleBrowserAlertToggleClick() {
        let update = {
            useBrowserAlert: !this.state.useBrowserAlert
        }
        this.setState(Object.assign(this.state, update));
    }

    handleMinimumPayUpdate(inputValue) {
        let minValue;
        if (inputValue === "") {
            minValue = 0
        } else {
            minValue = parseFloat(inputValue)
        }

        let update = {
            minimumPay: minValue
        }
        this.setState(Object.assign(this.state, update));
    }

    render() {
        const alertItems = this.state.items.filter(item => !item.skipAlert)
        const otherItems = this.state.items.filter(item => item.skipAlert)

        return (
            <div className="App">
                <h1 className="App-header">
                Gengo Reader
                </h1>

                <div>
                    <input
                        type="checkbox" checked={this.state.includeAllTypes}
                        onChange={() => this.handleStandardToggleClick()}
                    />
                    Include Standard/Edit
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
                    <input
                        type="checkbox" checked={this.state.useBrowserAlert}
                        onChange={() => this.handleBrowserAlertToggleClick()}
                    />
                    Use Browser Alert
                </div>

                <div>
                    Minimum Pay
                    <input onChange={
                        (event) => this.handleMinimumPayUpdate(event.target.value)
                    }/>
                </div>

                <div>
                    <button onClick={() => this.makeCall()}> Force Update </button>
                </div>

                <hr/>

                <div>
                Last Update: {this.state.lastUpdate}
                </div>

                <h2>New Items</h2>
                {alertItems.map(x => (
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
                {otherItems.map(x => (
                    <div>
                        <div>
                            {x.title}
                        </div>
                        <a href={x.link} target="_blank" rel="noreferrer">
                            {x.link}
                        </a>
                    </div>
                ))}

                {alertItems.length > 0 ? (
                    <div id="audio-alert">
                        <audio
                            autoPlay
                            controls
                            src="/bluedanube_3s.mp3">
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
        const alertItems = this.state.items.filter(item => !item.skipAlert)

        if (this.state.stopped) {
            document.title = '*STOPPED* Gengo Reader'
        } else {
            document.title = 'Gengo Reader'
        }
        if (this.state.useBrowserAlert && alertItems.length > 0) {
            alert('Hello')
        }
    }
}

export default App;
