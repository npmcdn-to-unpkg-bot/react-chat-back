import React from 'react';
import Constants from '../constants/Constants';
import Store from '../stores/Participants';
import ChatActions from '../actions/ChatActions';
import Colours from '../ui/colours.js';

function getParticipantsMessage(amount) {
  return amount > 1 ? `There are ${amount} participants:` : `There's 1 participant:`;
}

function getParticipants() {
  return Store.getCurrentMembers();
}

export default class Participants extends React.Component {
  constructor(props) {
    super(props);

    Object.keys(this.props).forEach(key => {
      this[key] = this.props[key];
    });

    this.state = { 
      amount: 1,
      display: false,
      members: []
    };
  }

  componentWillMount() {
    Store.removeChangeListener(this.onParticipantEvent);
  }

  componentDidMount() {
    const { socket } = this.props;
    const actions = new ChatActions();

    socket.on(Constants.Sockets.Events.Login, data => {
      actions.setMembers(data.users);
    });

    socket.on(Constants.Sockets.Events.Joiner, data => {
      //actions.setJoiner(data.username);
      actions.setMembers(data.users);
    });

    socket.on(Constants.Sockets.Events.Leaver, data => {
      actions.removeMember(data.username);
    });

    Store.addChangeListener(this.onParticipantEvent);
  }

  onParticipantEvent = () => {
    const participants = getParticipants();

    this.setState({
      display: true,
      members: participants.Members,
      amount: participants.Total
    });
  }

  getUsernameListing(member) {
      const colours = new Colours();

      return (
        <div 
            className="ms-ListItem message animated flipInX" 
            data-username={member}>
              <span 
                className="username ms-ListItem-primary" 
                style={{'color':colours.getUsernameColour(member)}}>
                {member}
              </span>
          </div>
      );
  }

  getWelcomeMessage() {
    if (this.state.display) {
        return (
          <div key="particpant-message">
            <span className="ms-ListItem-primaryText animated fadeIn">
              {getParticipantsMessage(this.state.amount)}
            </span>
            {this.state.members.map(this.getUsernameListing)}
          </div>
        ); 
    }
  }

  render() {
      return (
        <div key="participants" className="participant-list">
          {this.getWelcomeMessage()}
        </div>
      );
  }
}