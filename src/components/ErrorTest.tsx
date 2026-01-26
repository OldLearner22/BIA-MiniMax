import React, { useState } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

const BuggyButton = () => {
    const [clicked, setClicked] = useState(false);

    if (clicked) {
        throw new Error('This is a test error to verify the Error Boundary.');
    }

    return (
        <button
            onClick={() => setClicked(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <ShieldAlert className="w-4 h-4" />
            Trigger Test Error
        </button>
    );
};

export function ErrorTest() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-bia-text-primary">Error Boundary Test</h2>
                    <p className="text-bia-text-secondary">Verify the application's global error handling capabilities.</p>
                </div>
            </div>

            <div className="bg-bia-card border border-white/5 rounded-xl p-8 shadow-sm">
                <h3 className="text-lg font-medium text-bia-text-primary mb-4">Error Capture Zone</h3>
                <p className="text-bia-text-secondary mb-6 max-w-2xl">
                    The button below will intentionally throw a JavaScript error.
                    The Error Boundary component should catch this error and display a fallback UI instead of crashing the entire application.
                </p>

                <div className="p-6 bg-bia-bg-secondary/50 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-4">
                    <ErrorBoundary>
                        <BuggyButton />
                    </ErrorBoundary>
                </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h4 className="flex items-center gap-2 font-medium text-blue-400 mb-2">
                    <RefreshCw className="w-4 h-4" />
                    How it works
                </h4>
                <p className="text-sm text-blue-300/80">
                    React Error Boundaries catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of the component tree that crashed.
                </p>
            </div>
        </div>
    );
}
