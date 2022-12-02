import MediaQuery from 'react-responsive';

import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Typography from '@mui/material/Typography';

const style = {
  left: 20,
  bottom: 20,
  position: 'fixed'
};


export default function SideBar(props) {
  const conversations = Object.values(props.me.conversations);

  return (
    <div className='sidebar'>
      {conversations.length === 0 ? <div style={{ textAlign: 'center' }}>No conversations yet! Try starting one.</div> : null}
      <List disablePadding>
        {conversations.map((conversation) => {
          const members = Object.keys(conversation.members);
          const recipient = (members.length === 1 || members[0] !== props.me.id) ? members[0] : members[1];

          return (
            <SideBarItem
            display_name={props.me.users[recipient].username}
            selected={props.currentConversation === conversation.id}
            click={() => props.openConversation(conversation.id)}
            />
          )
        })}
      </List>
      <Fab
      onClick={props.newConversation}
      sx={style}
      color='primary'
      aria-label='add'
      >
        <EditIcon />
      </Fab>
    </div>
  );
}

function SideBarItem(props) {
  const avatar = props.display_name.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '').slice(0, 2);
  return (
    <div>
      <ListItemButton onClick={props.click} selected={props.selected}>
        <ListItemAvatar>
          <Avatar color='primary'>{avatar}</Avatar>
        </ListItemAvatar>

        <ListItemText>
          <Typography noWrap>{props.display_name}</Typography>
        </ListItemText>
      </ListItemButton>

      <MediaQuery maxWidth={500}>
        <Divider light />
      </MediaQuery>
    </div>
  );
}
