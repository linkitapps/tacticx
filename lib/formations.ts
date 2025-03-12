import type { FormationType } from "@/store/useEditorStore"

// Helper function to create player positions
// We'll swap x and y coordinates to match horizontal pitch orientation
const createFormation = (name: string, positions: number[][]): FormationType => {
  const players = positions.map((pos, index) => ({
    // Swap x and y coordinates for horizontal orientation
    // y becomes x (horizontal position)
    // x becomes y (vertical position)
    x: pos[1] / 100, // Normalize to 0-1 range (using original y)
    y: pos[0] / 100, // Normalize to 0-1 range (using original x)
    number: index + 1,
    color: "#19B8A6", // Vibrant Teal
    team: "home" as const,
  }))

  return { name, players }
}

// Common formations
// The coordinates are defined as [vertical, horizontal] but will be swapped in the createFormation function
export const formations: FormationType[] = [
  // 4-4-2
  createFormation("4-4-2", [
    [50, 10], // GK
    [20, 30], // LB
    [35, 30], // CB
    [65, 30], // CB
    [80, 30], // RB
    [20, 50], // LM
    [40, 50], // CM
    [60, 50], // CM
    [80, 50], // RM
    [35, 70], // ST
    [65, 70], // ST
  ]),

  // 4-3-3
  createFormation("4-3-3", [
    [50, 10], // GK
    [20, 30], // LB
    [35, 30], // CB
    [65, 30], // CB
    [80, 30], // RB
    [30, 50], // CM
    [50, 45], // CDM
    [70, 50], // CM
    [25, 70], // LW
    [50, 75], // ST
    [75, 70], // RW
  ]),

  // 3-5-2
  createFormation("3-5-2", [
    [50, 10], // GK
    [30, 30], // CB
    [50, 25], // CB
    [70, 30], // CB
    [15, 50], // LWB
    [35, 50], // CM
    [50, 45], // CDM
    [65, 50], // CM
    [85, 50], // RWB
    [35, 70], // ST
    [65, 70], // ST
  ]),

  // 4-2-3-1
  createFormation("4-2-3-1", [
    [50, 10], // GK
    [20, 30], // LB
    [35, 30], // CB
    [65, 30], // CB
    [80, 30], // RB
    [35, 45], // CDM
    [65, 45], // CDM
    [20, 60], // LM
    [50, 60], // CAM
    [80, 60], // RM
    [50, 75], // ST
  ]),

  // 5-3-2
  createFormation("5-3-2", [
    [50, 10], // GK
    [15, 30], // LWB
    [30, 25], // CB
    [50, 20], // CB
    [70, 25], // CB
    [85, 30], // RWB
    [30, 50], // CM
    [50, 45], // CDM
    [70, 50], // CM
    [35, 70], // ST
    [65, 70], // ST
  ]),
]

