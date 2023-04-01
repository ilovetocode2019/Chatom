import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import Dialog from '@suid/material/Dialog';
import DialogActions from '@suid/material/DialogActions';
import DialogContent from '@suid/material/DialogContent';
import DialogTitle from '@suid/material/DialogTitle';
import Grid from '@suid/material/Grid';
import Switch from '@suid/material/Switch';
import Typography from '@suid/material/Typography';

export default function Settings(props) {
  <Dialog open={true} onClose={props.close}>
    <DialogTitle variant='h5' textAlign='center'>
      Settings
    </DialogTitle>

    <DialogContent>
      <Grid
      container
      direction='column'
      >
        <Box sx={{m: 1}} />

        <Grid item>
          <Typography variant='h6'>Account</Typography>
        </Grid>

        <Grid item>
          <Typography display='inline'><b>Email</b><br />example@domain.com</Typography>
        </Grid>

        <Grid item>
          <Button fullWidth variant='contained'>Change</Button>
        </Grid>

        <Box sx={{m: 1}} />

        <Grid item>
          <Typography display='inline'><b>Username</b><br />Example User</Typography>
        </Grid>

        <Grid item>
          <Button fullWidth variant='contained'>Change</Button>
        </Grid>

        <Box sx={{m: 2}} />

        <Grid item>
          <Typography variant='h6'>Device</Typography>
        </Grid>

        <Grid item>
          <Grid container spacing={1}>
            <Grid item>
              <Typography sx={{display: 'inline'}} display='inline'>Notifications</Typography>
              <Switch checked={true} />
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{m: 1}} />

        <Grid item>
          <Typography variant='h6'>Security</Typography>
        </Grid>

        <Grid item>
          <Grid container spacing={1}>
            <Grid item>
              <Button variant='contained' color='warning'>Change Password</Button>
            </Grid>

            <Grid item>
              <Button variant='contained' color='error'>Log Out</Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </DialogContent>

    <DialogActions>
      <Button onClick={props.close}>Done</Button>
    </DialogActions>
  </Dialog>
}
