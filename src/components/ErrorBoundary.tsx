import React, { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    }

    interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: { componentStack: string | null | undefined } | null;
    }

    /**
     * ErrorBoundary - Captura erros de componentes filhos
     * Previne que toda a aplicação quebre quando um componente falha
     */
    export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
        hasError: false,
        error: null,
        errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
        hasError: true,
        error,
        errorInfo: { componentStack: errorInfo.componentStack },
        });
    }

    handleReset = () => {
        this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
        return (
            <div className="min-h-screen bg-linear-to-br from-red-950 to-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 border border-red-500 rounded-lg shadow-2xl p-8">
                {/* Header */}
                <div className="flex items-center justify-center mb-6">
                <div className="bg-red-500 rounded-full p-3">
                    <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    </svg>
                </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white text-center mb-2">
                Oops! Algo deu errado
                </h1>

                {/* Description */}
                <p className="text-slate-300 text-center mb-6 text-sm">
                Um erro inesperado ocorreu. Tente recarregar a página ou volte para a página inicial.
                </p>

                {/* Error Details (Development Only) */}
                {import.meta.env.DEV && this.state.error && (
                <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
                    <p className="text-xs font-mono text-red-400 break-long mb-2">
                    {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                    <details className="text-xs text-slate-400">
                        <summary className="cursor-pointer font-semibold mb-2 hover:text-slate-300">
                        Detalhes técnicos
                        </summary>
                        <pre className="overflow-auto max-h-32 text-red-300 text-xs">
                        {this.state.errorInfo.componentStack}
                        </pre>
                    </details>
                    )}
                </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                <button
                    onClick={this.handleReset}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                >
                    Tentar Novamente
                </button>
                <a
                    href="/"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 text-center"
                >
                    Voltar à Página Inicial
                </a>
                </div>
            </div>
            </div>
        );
        }

        return this.props.children;
    }
}
