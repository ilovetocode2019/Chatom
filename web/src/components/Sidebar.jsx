import { For, createSignal } from 'solid-js';

import Avatar from '@suid/material/Avatar';
import Button from '@suid/material/Button';
import IconButton from '@suid/material/IconButton';
import List from '@suid/material/List';
import ListItemButton from '@suid/material/ListItemButton';
import ListItemText from '@suid/material/ListItemText';
import ListItemAvatar from '@suid/material/ListItemAvatar';
import ListSubheader from '@suid/material/ListSubheader';
import Menu from '@suid/material/Menu';
import MenuItem from '@suid/material/MenuItem';
import MoreVertIcon from '@suid/icons-material/MoreVert';
import Typography from '@suid/material/Typography';

import { useState } from './Home';

export default function Sidebar(props) {
  let menuAnchor;

  const [state, api] = useState();
  const [showMenu, setShowMenu] = createSignal(false);

  const conversations = () => state.conversations ?? {};

  const newConversation = () => {
    props.newConversation();
    setShowMenu(false);
  }

  const showSettings = () => {
    props.showSettings();
    setShowMenu(false);
  }

  return (
    <div ref={props.ref} class='sidebar'>
      <List disablePadding subheader={
        <ListSubheader sx={{margin: '10px'}}>
          <Typography variant='h5' align='center'>
            Chatom

            <IconButton onClick={() => setShowMenu(true)} sx={{float: 'right', verticalAlign: 'center', padding: 0}}>
                <MoreVertIcon ref={menuAnchor} />
            </IconButton>
          </Typography>

        </ListSubheader>
      }>
          <For each={Object.keys(conversations())}>{(conversation, i) =>
            <SidebarItem
            conversation={conversations()[conversation]}
            selected={conversation == props.currentConversation}
            select={() => props.setConversation(conversation)}
            />
          }</For>
      </List>

      <Show when={state.conversations && Object.keys(conversations()).length === 0}>
        <Typography sx={{textAlign: 'center', margin: '15px'}}>
          <b>You aren't in any conversations yet...</b>

          <br />

          <Button onClick={props.newConversation} variant='contained'>
            Create Conversation
          </Button>
        </Typography>
      </Show>

      <Menu
      anchorEl={menuAnchor}
      open={showMenu()}
      onClose={() => setShowMenu(false)}
      >
        <MenuItem key='New Conversation' onClick={newConversation}>
          New Conversation
        </MenuItem>

        <MenuItem key='Settings' onClick={showSettings}>
          Settings
        </MenuItem>
      </Menu>
    </div>
  );
}

function SidebarItem(props) {
    const [state, api] = useState();

    const members = Object.keys(props.conversation.members);
    const user = state.users[members[0] !== state.id || members.length == 1 ? members[0] : members[1]];
    const avatar = user.username.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '').slice(0, 2);

    return (
        <ListItemButton sx={{padding: '15px'}} onClick={props.select} selected={props.selected}>
            <ListItemAvatar>
                <Avatar>{avatar.toUpperCase()}</Avatar>
            </ListItemAvatar>

            <ListItemText>
              <Typography noWrap>{user.username}</Typography>
            </ListItemText>
        </ListItemButton>
    );
}
