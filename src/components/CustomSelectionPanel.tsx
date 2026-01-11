import { useState } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import './CustomSelectionPanel.css';

interface CustomSelectionPanelProps {
    overlayRef: React.RefObject<OverlayPanel | null>;
    onSelect: (count: number) => void;
    currentPageSize: number;
}

const CustomSelectionPanel = ({ overlayRef, onSelect, currentPageSize }: CustomSelectionPanelProps) => {
    const [inputValue, setInputValue] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        const count = parseInt(inputValue, 10);

        if (!inputValue.trim() || isNaN(count) || count <= 0) {
            setError('Please enter a valid positive number');
            return;
        }

        setError('');
        onSelect(count);
        setInputValue('');
        overlayRef.current?.hide();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <OverlayPanel ref={overlayRef} className="custom-selection-overlay">
            <div className="overlay-content">
                <h3 className="overlay-title">Select Multiple Rows</h3>

                <p className="overlay-description">
                    Rows will continue selecting across pages automatically
                </p>

                <div className="input-group">
                    <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter any number"
                        className="custom-input"
                        min={1}
                    />

                    <button
                        onClick={handleSubmit}
                        className="submit-btn"
                        disabled={!inputValue}
                    >
                        Select
                    </button>
                </div>

                {error && (
                    <div className="error-text">
                        <span className="error-icon">⚠️</span>
                        {error}
                    </div>
                )}

                <div className="info-box">
                    <div className="info-item">
                        <span className="info-label">Rows per page:</span>
                        <span className="info-value">{currentPageSize}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">Selection:</span>
                        <span className="info-value">Cross-page enabled</span>
                    </div>
                </div>
            </div>
        </OverlayPanel>
    );
};

export default CustomSelectionPanel;
