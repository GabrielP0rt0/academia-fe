import { Component } from 'react';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryClass extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({ error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ops! Algo deu errado</h1>
        <p className="text-gray-600 mb-6">
          Ocorreu um erro inesperado. Por favor, tente novamente.
        </p>
        {error && (
          <details className="mb-6 text-left max-w-md mx-auto">
            <summary className="cursor-pointer text-primary">Detalhes do erro</summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-sm overflow-auto">
              {error.toString()}
            </pre>
          </details>
        )}
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Recarregar página
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-outline"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundaryClass;

