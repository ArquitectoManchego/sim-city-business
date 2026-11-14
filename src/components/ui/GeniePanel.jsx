/**
 * Contenedor reutilizable con animación estilo Mac Dock "Genie":
 * Al minimizar se estira y encoge suavemente hacia el botón/icono origen,
 * y al maximizar se estira desde el icono hasta su tamaño completo.
 */

import React, { useEffect, useState } from 'react';

export default function GeniePanel({
  isMinimized,
  origin = 'bottom left', // 'bottom left' | 'bottom right' | 'top left' | 'top right' | 'center'
  direction = 'bottom', // 'bottom' | 'top'
  className = '',
  dockClassName = '',
  renderDockIcon = null,
  children
}) {
  const [phase, setPhase] = useState(isMinimized ? 'minimized' : 'open');

  useEffect(() => {
    if (isMinimized) {
      if (phase === 'open' || phase === 'maximizing') {
        setPhase('minimizing');
        const timer = setTimeout(() => {
          setPhase('minimized');
        }, 330);
        return () => clearTimeout(timer);
      }
    } else {
      if (phase === 'minimized' || phase === 'minimizing') {
        setPhase('maximizing');
        const timer = setTimeout(() => {
          setPhase('open');
        }, 380);
        return () => clearTimeout(timer);
      }
    }
  }, [isMinimized]);

  if (phase === 'minimized') {
    return renderDockIcon ? (
      <div className={`genie-dock-pop ${dockClassName}`}>{renderDockIcon()}</div>
    ) : null;
  }

  const animClass =
    phase === 'minimizing'
      ? direction === 'top'
        ? 'genie-exit-top pointer-events-none'
        : 'genie-exit-bottom pointer-events-none'
      : phase === 'maximizing'
        ? direction === 'top'
          ? 'genie-enter-top'
          : 'genie-enter-bottom'
        : '';

  return (
    <div
      style={{ transformOrigin: origin }}
      className={`${animClass} ${className}`}
    >
      {children}
    </div>
  );
}
