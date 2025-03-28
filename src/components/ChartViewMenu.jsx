import React from 'react';

const ChartViewMenu = ({ currentView, onViewChange }) => {
  return (
    <div className="chart-view-menu">
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
      {/* Removendo o terceiro ícone e suas funcionalidades */}
      {/* <button
        className={`view-button ${currentView === 'fullscreen' ? 'active' : ''}`}
        onClick={() => onViewChange('fullscreen')}
      >
        Fullscreen
      </button> */}
    </div>
  );
};

export default ChartViewMenu;