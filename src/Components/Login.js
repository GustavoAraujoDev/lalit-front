import React, { useState } from 'react';
import { Grid, Typography, Button, TextField, Avatar } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from '../Auth/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import imageUrl from '../assets/logo (2).jpeg';
function Login({ login }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate(); // Initialize useNavigate
    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, username, password);
            toast.success("Login bem-sucedido!");
            login();
            navigate('/home'); // Use navigate to redirect  
      } catch (error) {

            toast.error(error.message);
        }
    };

    return (
        <>
            <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh', backgroundColor: '#c7c7c6' }}>
                <Grid item xs={10} style={{ width: '80%', height: '80%' }}>
                    <Grid container justifyContent="center" alignItems="center" style={{ backgroundColor: 'white', minHeight: '80vh', borderRadius: '16px 0 0 16px' }}>
                        <Grid item xs={5} style={{minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#bfccdd', backgroundColor: '#febac5', borderRadius: '16px', minHeight: '80vh' }}>
                            <Typography fontFamily="serif" fontSize="24px">Lalitá</Typography>
                            <Typography fontFamily="serif">Seja Bem Vindo de Volta</Typography>
                            <Avatar alt="Logo" src={imageUrl} sx={{ bgcolor: '#c0844a', width: '150px', height: '150px', marginBottom: '20px', borderRadius: '16px 0 0 15px' }} />
                        </Grid>
                        <Grid item xs={7} style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#bfccdd', alignItems: 'center' }}>
                            <Typography fontFamily="serif" fontSize="24px">Bem Vindo</Typography>
                            <Typography fontFamily="serif">Lalitá</Typography>
                            <TextField label="UserName" value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginTop: '20px' }} />
                            <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginTop: '20px' }} />
                            <Button variant="contained" onClick={handleLogin} style={{ backgroundColor: '#bfccdd', borderColor: '#bfccdd', borderWidth: '4px', borderRadius: '16px', marginTop: '20px' }} fontFamily="serif">Entrar</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <ToastContainer />
        </>
    );
}

export default Login;
