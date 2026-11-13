import React from 'react';

/**
 * Decoration for the empty right side of inner-page headers: a slowly turning
 * wireframe cube (the CUBE mark, drawn in thin lines with glowing yellow
 * edges), a smaller cube turning the other way inside it, and faint diagonal
 * light strips drifting behind. Pure CSS 3D (transform animations only, on
 * the compositor), aria-hidden, shown from 1400px wide; still for reduced motion.
 * Styles: .hc-* in globals.css.
 */
function Cube({ size, className }: { size: number; className: string }) {
  const faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  return (
    <div className={`hc-cube ${className}`} style={{ width: size, height: size, ['--hc-half' as string]: `${size / 2}px` }}>
      {faces.map((f) => (
        <span key={f} className={`hc-face hc-${f}`} />
      ))}
    </div>
  );
}

export default function HeaderCube() {
  return (
    <div aria-hidden className="hc-stage hidden min-[1400px]:block pointer-events-none">
      {/* light strips */}
      <span className="hc-strip" style={{ ['--d' as string]: '0s', top: '18%' }} />
      <span className="hc-strip" style={{ ['--d' as string]: '-3.2s', top: '46%' }} />
      <span className="hc-strip" style={{ ['--d' as string]: '-6.4s', top: '72%' }} />
      {/* soft glow under the cube */}
      <span className="hc-glow" />
      <div className="hc-scene">
        <Cube size={150} className="hc-outer" />
        <Cube size={72} className="hc-inner" />
      </div>
    </div>
  );
}
