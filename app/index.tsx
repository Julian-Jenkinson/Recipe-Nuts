// app/index.tsx
import { Redirect } from 'expo-router';

// safety net redirect to recipes folder
export default function Index() {
  return <Redirect href="/recipes" />;
}