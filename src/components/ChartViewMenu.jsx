import React from 'react';
import ThemeToggle from './ThemeToggle';

const ChartViewMenu = ({ currentView, onViewChange, theme, toggleTheme }) => {
  return (
    <div className="chart-view-menu">
      <div className="view-buttons">
        <button
          className={`view-button ${currentView === 'vertical' ? 'active' : ''}`}
          onClick={() => onViewChange('vertical')}
        >
          Vertical
        </button>
        <button
          className={`view-button ${currentView === 'grid' ? 'active' : ''}`}
          onClick={() => onViewChange('grid')}
        >
          Grid
        </button>
      </div>
      
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};

export default ChartViewMenu;