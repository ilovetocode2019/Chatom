import React from 'react';

import AppBar from '@mui/material/AppBar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

class Conversation extends React.Component {
  componentDidMount() {
    this.messageEnd.scrollIntoView();
  }

  componentDidUpdate(prevProps) {
    this.messageEnd.scrollIntoView();
  }

  render() {
    const conversation = this.props.me.conversations[this.props.currentConversation];
    const messages = this.props.messages ? Object.values(this.props.messages) : [];

    const members = Object.keys(conversation.members);
    const recipient = (members.length === 1 || members[0] !== this.props.me.id) ? members[0] : members[1];

    return (
      <div className='conversation'>
        <AppBar sx={{ boxShadow: 'none' }} position='sticky'>
          <Typography sx={{ textAlign: 'center' }} variant='h6'>
            {this.props.exit ? (
              <IconButton onClick={this.props.exit}>
                <ArrowBackIcon />
              </IconButton>
            ) : (
              null
            )}

            {this.props.me.users[recipient].username}
          </Typography>
        </AppBar>

        <div className='messages'>
          {messages.map((message) => (
            <Message
            author={this.props.me.users[message.author_id].username}
            content={message.content}
            />
          ))}
          <div ref={(el) => {this.messageEnd = el}} />
        </div>

        <ConversationInput submit={(content) => this.props.sendMessage(conversation.id, content)} />
      </div>
    );
  }
}

class Message extends React.Component {
  render() {
    return (
      <div className='message'>
        <b><span>{this.props.author}</span></b>
        <br />
        {this.props.content}
        <br />
        <br />
      </div>
    )
  }
}

class ConversationInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    this.input.focus();
  }

  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.value) {
      return;
    }

    this.props.submit(this.state.value);
    this.setState({value: ''});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
        className='message-input'
        type='text'
        placeholder='Type a message...'
        ref={(input) => {this.input = input}}
        value={this.state.value}
        onChange={this.handleChange}
        />
      </form>
    );
  }
}

export default Conversation;
