import { useMediaQuery } from 'react-responsive';

import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import PersonIcon from '@mui/icons-material/Person';
import Typography from '@mui/material/Typography';
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction';

const style = {
  position: 'absolute',
  bottom: 20,
  right: 20
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

      <SpeedDial
      ariaLabel='fab'
      sx={style}
      icon={<PersonIcon />}
      >
        <SpeedDialAction
        icon={<EditIcon />}
        tooltipTitle='New Conversation'
        tooltipOpen
        onClick={props.newConversation}
        />

        <SpeedDialAction
        icon={<SettingsIcon />}
        tooltipTitle='Settings'
        tooltipOpen
        onClick={props.showSettings}
        />
      </SpeedDial>
    </div>
  );
}

function SideBarItem(props) {
  const avatar = props.display_name.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '').slice(0, 2);
  const is_mobile = useMediaQuery({ query: '(max-width: 500px)' });

  return (
    <div>
      <ListItemButton sx={{ padding: is_mobile? '15px' : '10px' }} onClick={props.click} selected={props.selected}>
        <ListItemAvatar>
          <Avatar color='primary'>{avatar.toUpperCase()}</Avatar>
        </ListItemAvatar>

        <ListItemText>
          <Typography noWrap>{props.display_name}</Typography>
        </ListItemText>
      </ListItemButton>

      {is_mobile ? <Divider light /> : null}
    </div>
  );
}
