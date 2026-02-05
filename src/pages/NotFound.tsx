import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <h1 className="text-4xl font-bold text-red-600">404</h1>
      <p className="text-lg text-muted-foreground">Page Not Found</p>
      <Button onClick={() => navigate('/')}>Go Home</Button>
    </div>
  );
}