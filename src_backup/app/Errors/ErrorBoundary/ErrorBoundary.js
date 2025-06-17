import { jsx as _jsx } from "react/jsx-runtime";
import { Component } from 'react';
import { NotFound } from '@src/app/Errors/NotFound';
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error, errorInfo: null };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return _jsx(NotFound, { type: 'FALLBACK' });
        }
        return this.props.children;
    }
}
export default ErrorBoundary;
