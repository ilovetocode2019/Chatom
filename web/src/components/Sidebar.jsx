import { For, createSignal } from 'solid-js';
import { List, ListItemButton, ListItemAvatar, ListItemText, Avatar, Typography } from '@suid/material';

function Sidebar() {
  const [conversations, setConversations] = createSignal([])
  return (
    <div class='sidebar'>
      <List class='sidebar' disablePadding>
          <For each={conversations()}>{(conversation, i) =>
            <SidebarItem conversation={conversation}/>
          }</For>
      </List>
    </div>
  );
}

function SidebarItem(props) {
    const avatar = () => props.conversation.split(/\s/).reduce((response, word) => response += word.slice(0, 1), '').slice(0, 2);

    return (
        <ListItemButton>
            <ListItemAvatar>
                <Avatar>{avatar().toUpperCase()}</Avatar>
            </ListItemAvatar>

            <ListItemText>
              <Typography noWrap>{props.conversation}</Typography>
            </ListItemText>
        </ListItemButton>
    );
}

export default Sidebar;
