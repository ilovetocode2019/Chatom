import { For, createSignal } from 'solid-js';

import Avatar from '@suid/material/Avatar';
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

  const [state, setState] = useState();
  const [showMenu, setShowMenu] = createSignal(false);

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
          <For each={Object.values(state.conversations)}>{(conversation, i) =>
            <SidebarItem
            conversation={conversation}
            selected={conversation.id == props.currentConversation}
            select={() => props.setConversation(conversation.id)}
            />
          }</For>
      </List>

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
    const [state, setState] = useState();
    const user = () => state.users[Object.values(props.conversation.members)[0].user_id];
    const avatar = () => user().username.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '').slice(0, 2);

    return (
        <ListItemButton sx={{padding: '15px'}} onClick={props.select} selected={props.selected}>
            <ListItemAvatar>
                <Avatar>{avatar().toUpperCase()}</Avatar>
            </ListItemAvatar>

            <ListItemText>
              <Typography noWrap>{user().username}</Typography>
            </ListItemText>
        </ListItemButton>
    );
}
