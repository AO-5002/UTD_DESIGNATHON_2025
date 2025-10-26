/**
 * PuzzlePiece Component
 * Generates interlocking puzzle pieces with consistent dimensions
 * Each piece automatically determines which edges should have tabs or blanks
 * based on its position in the grid
 */

type PuzzlePieceProps = {
  color: string;
  size?: number;
  hasTopTab?: boolean;
  hasRightTab?: boolean;
  hasBottomTab?: boolean;
  hasLeftTab?: boolean;
};

export function generatePuzzlePiecePath({
  size = 120,
  hasTopTab = false,
  hasRightTab = false,
  hasBottomTab = false,
  hasLeftTab = false,
}: Omit<PuzzlePieceProps, "color">): string {
  const tabSize = size * 0.15; // Tab protrusion size
  const tabWidth = size * 0.3; // Width of the tab/blank
  const center = size / 2;

  let path = `M 0 0`; // Start at top-left corner

  // TOP EDGE
  if (hasTopTab) {
    // Tab protruding upward
    path += `
      L ${center - tabWidth / 2} 0
      Q ${center - tabWidth / 2} ${-tabSize / 2}, ${center} ${-tabSize}
      Q ${center + tabWidth / 2} ${-tabSize / 2}, ${center + tabWidth / 2} 0
      L ${size} 0`;
  } else {
    path += ` L ${size} 0`;
  }

  // RIGHT EDGE
  if (hasRightTab) {
    // Tab protruding rightward
    path += `
      L ${size} ${center - tabWidth / 2}
      Q ${size + tabSize / 2} ${center - tabWidth / 2}, ${
      size + tabSize
    } ${center}
      Q ${size + tabSize / 2} ${center + tabWidth / 2}, ${size} ${
      center + tabWidth / 2
    }
      L ${size} ${size}`;
  } else {
    path += ` L ${size} ${size}`;
  }

  // BOTTOM EDGE
  if (hasBottomTab) {
    // Tab protruding downward
    path += `
      L ${center + tabWidth / 2} ${size}
      Q ${center + tabWidth / 2} ${size + tabSize / 2}, ${center} ${
      size + tabSize
    }
      Q ${center - tabWidth / 2} ${size + tabSize / 2}, ${
      center - tabWidth / 2
    } ${size}
      L 0 ${size}`;
  } else {
    path += ` L 0 ${size}`;
  }

  // LEFT EDGE
  if (hasLeftTab) {
    // Tab protruding leftward
    path += `
      L 0 ${center + tabWidth / 2}
      Q ${-tabSize / 2} ${center + tabWidth / 2}, ${-tabSize} ${center}
      Q ${-tabSize / 2} ${center - tabWidth / 2}, 0 ${center - tabWidth / 2}
      L 0 0`;
  } else {
    path += ` L 0 0`;
  }

  path += ` Z`;
  return path;
}

export function PuzzlePieceSVG({
  color,
  size = 120,
  hasTopTab = false,
  hasRightTab = false,
  hasBottomTab = false,
  hasLeftTab = false,
}: PuzzlePieceProps) {
  const tabSize = size * 0.15;
  const viewBoxSize = size + tabSize * 2;
  const offset = tabSize;

  const path = generatePuzzlePiecePath({
    size,
    hasTopTab,
    hasRightTab,
    hasBottomTab,
    hasLeftTab,
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`${-offset} ${-offset} ${viewBoxSize} ${viewBoxSize}`}
      style={{ overflow: "visible" }}
    >
      <path
        d={path}
        fill={color}
        stroke="#2d3748"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Determines which edges should have tabs based on grid position
 * Uses a checkerboard pattern to ensure pieces interlock properly
 */
export function getTabConfiguration(row: number, col: number) {
  // Checkerboard pattern: even positions have tabs on top/left, odd on bottom/right
  const isEvenRow = row % 2 === 0;
  const isEvenCol = col % 2 === 0;

  return {
    hasTopTab: isEvenRow,
    hasRightTab: !isEvenCol,
    hasBottomTab: !isEvenRow,
    hasLeftTab: isEvenCol,
  };
}

export default PuzzlePieceSVG;
