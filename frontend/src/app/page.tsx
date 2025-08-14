import Calculator from './components/Calculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Test Application
          </h1>
          <p className="text-gray-600">
            A simple calculator that adds two numbers together
          </p>
        </header>
        
        <Calculator />
        
        <footer className="text-center mt-12 text-gray-500">
          <p>Built with Node.js, Next.js, and MongoDB</p>
        </footer>
      </div>
    </div>
  );
}
