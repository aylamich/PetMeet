import { useEffect, useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api')
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Home</h1>
      <p>Welcome to the Home page!</p>
      <p>Message from backend: {message}</p>
    </div>
  );
}