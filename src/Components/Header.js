import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import imageUrl from '../assets/sublogo.jpeg';
function Header() {
  return (
    <AppBar position="static" elevation={1} style={{ backgroundColor: '#fff', color: '#c0844a', height: '87px', justifyContent: 'center' }}>
      <Toolbar>
        <Avatar alt="Logo" src={imageUrl} sx={{ marginRight: '10px', width: 58, height: 58, boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)' }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Lalitá
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
