import Button from '@helix/app/components/Button';

export default function Home(): React.ReactNode {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Button text="Hello World" onClick={() => console.log('Greetings!')} />
    </div>
  );
}