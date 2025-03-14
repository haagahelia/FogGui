'use client';

import { useState, useRef } from 'react';
import { Container, TextField, Button, Typography, Box } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleLogin = async () => {
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError('Invalid username or password');
      setTimeout(() => setError(''), 3000);
    } else {
      router.push('/dashboard'); // Redirect on success
    }
  };

  return (
    <Container maxWidth="xs">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" marginTop="20vh" sx={{ border: '3px solid #ccc', padding: 5, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Fog Project Login
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField label="Username" variant="outlined" margin="normal" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && passwordRef.current?.focus()} />
        <TextField label="Password" type="password" variant="outlined" margin="normal" fullWidth value={password} inputRef={passwordRef} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
        <Button type='submit' onClick={handleLogin}>Login</Button>
      </Box>
    </Container>
  );
}
