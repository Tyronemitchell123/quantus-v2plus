import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Trash2, Plus, Download, RotateCcw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type GateType = "h" | "x" | "y" | "z" | "s" | "t" | "cx" | "ccx" | "swap" | "rx" | "ry" | "rz" | "measure";

interface Gate {
  id: string;
  type: GateType;
  qubit: number;
  target?: number; // for 2-qubit gates
  control2?: number; // for ccx
  angle?: number; // for rotation gates
}

const GATE_PALETTE: { type: GateType; label: string; color: string; qubits: number; desc: string }[] = [
  { type: "h", label: "H", color: "bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan/30", qubits: 1, desc: "Hadamard — creates superposition" },
  { type: "x", label: "X", color: "bg-red-500/20 text-red-400 border-red-500/30", qubits: 1, desc: "Pauli-X — bit flip (NOT gate)" },
  { type: "y", label: "Y", color: "bg-green-500/20 text-green-400 border-green-500/30", qubits: 1, desc: "Pauli-Y — rotation around Y axis" },
  { type: "z", label: "Z", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", qubits: 1, desc: "Pauli-Z — phase flip" },
  { type: "s", label: "S", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", qubits: 1, desc: "S gate — π/2 phase shift" },
  { type: "t", label: "T", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", qubits: 1, desc: "T gate — π/4 phase shift" },
  { type: "cx", label: "CX", color: "bg-quantum-purple/20 text-quantum-purple border-quantum-purple/30", qubits: 2, desc: "CNOT — controlled NOT" },
  { type: "swap", label: "SW", color: "bg-pink-500/20 text-pink-400 border-pink-500/30", qubits: 2, desc: "SWAP — exchange two qubits" },
  { type: "measure", label: "M", color: "bg-foreground/10 text-foreground border-border", qubits: 1, desc: "Measurement — collapse to classical" },
];

let _gateId = 0;
const nextId = () => `g${++_gateId}`;

interface VisualCircuitEditorProps {
  onExport: (qasm: string) => void;
}

export default function VisualCircuitEditor({ onExport }: VisualCircuitEditorProps) {
  const [numQubits, setNumQubits] = useState(3);
  const [gates, setGates] = useState<Gate[]>([]);
  const [dragGate, setDragGate] = useState<GateType | null>(null);

  const addGate = useCallback((type: GateType, qubit: number) => {
    const info = GATE_PALETTE.find(g => g.type === type);
    const gate: Gate = { id: nextId(), type, qubit };
    if (info && info.qubits === 2) {
      gate.target = (qubit + 1) % numQubits;
    }
    setGates(prev => [...prev, gate]);
  }, [numQubits]);

  const removeGate = useCallback((id: string) => {
    setGates(prev => prev.filter(g => g.id !== id));
  }, []);

  const clearAll = () => setGates([]);

  // Group gates by step (column) per qubit
  const columns = useMemo(() => {
    const cols: Gate[][] = [];
    const qubitStep = new Array(numQubits).fill(0);
    for (const gate of gates) {
      const info = GATE_PALETTE.find(g => g.type === gate.type);
      const step = info && info.qubits === 2
        ? Math.max(qubitStep[gate.qubit], qubitStep[gate.target ?? 0])
        : qubitStep[gate.qubit];
      if (!cols[step]) cols[step] = [];
      cols[step].push(gate);
      qubitStep[gate.qubit] = step + 1;
      if (info && info.qubits === 2 && gate.target !== undefined) {
        qubitStep[gate.target] = step + 1;
      }
    }
    return cols;
  }, [gates, numQubits]);

  // Generate OpenQASM
  const toQasm = useCallback(() => {
    let qasm = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[${numQubits}];\ncreg c[${numQubits}];\n`;
    for (const gate of gates) {
      switch (gate.type) {
        case "h": case "x": case "y": case "z": case "s": case "t":
          qasm += `${gate.type} q[${gate.qubit}];\n`; break;
        case "cx":
          qasm += `cx q[${gate.qubit}], q[${gate.target ?? 0}];\n`; break;
        case "swap":
          qasm += `swap q[${gate.qubit}], q[${gate.target ?? 0}];\n`; break;
        case "measure":
          qasm += `measure q[${gate.qubit}] -> c[${gate.qubit}];\n`; break;
        default: break;
      }
    }
    return qasm;
  }, [gates, numQubits]);

  const handleDrop = (qubit: number) => {
    if (dragGate) {
      addGate(dragGate, qubit);
      setDragGate(null);
    }
  };

  const CELL = 52;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-quantum-purple" />
          <span className="text-sm font-semibold text-foreground">Visual Circuit Builder</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setNumQubits(n => Math.min(n + 1, 8))}>
            <Plus size={14} className="mr-1" /> Qubit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setNumQubits(n => Math.max(n - 1, 1)); setGates(g => g.filter(x => x.qubit < numQubits - 1 && (x.target === undefined || x.target < numQubits - 1))); }}>
            − Qubit
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            <RotateCcw size={14} className="mr-1" /> Clear
          </Button>
          <Button size="sm" onClick={() => onExport(toQasm())} className="bg-quantum-purple text-white hover:bg-quantum-purple/90">
            <Download size={14} className="mr-1" /> Export QASM
          </Button>
        </div>
      </div>

      {/* Gate palette */}
      <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
        {GATE_PALETTE.map(g => (
          <Tooltip key={g.type}>
            <TooltipTrigger asChild>
              <button
                draggable
                onDragStart={() => setDragGate(g.type)}
                className={`w-10 h-10 rounded-lg border font-mono text-xs font-bold flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform hover:scale-110 active:scale-95 ${g.color}`}
              >
                {g.label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-48">{g.desc}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Circuit canvas */}
      <div className="overflow-x-auto rounded-lg border border-border bg-background/50 p-4">
        <div className="min-w-[400px]" style={{ minHeight: numQubits * CELL + 16 }}>
          {Array.from({ length: numQubits }).map((_, q) => (
            <div
              key={q}
              className="flex items-center h-[52px] group"
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(q)}
            >
              {/* Qubit label */}
              <span className="w-12 text-xs font-mono text-muted-foreground shrink-0">q[{q}]</span>
              {/* Wire */}
              <div className="flex-1 relative h-[2px] bg-border group-hover:bg-quantum-cyan/30 transition-colors">
                {/* Gates on this qubit */}
                <div className="absolute inset-y-0 flex items-center gap-1" style={{ top: -18 }}>
                  <AnimatePresence>
                    {gates.filter(g => g.qubit === q || g.target === q).map((gate, idx) => {
                      const info = GATE_PALETTE.find(p => p.type === gate.type);
                      return (
                        <motion.div
                          key={gate.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="relative"
                          style={{ marginLeft: idx === 0 ? 8 : 0 }}
                        >
                          <button
                            onClick={() => removeGate(gate.id)}
                            className={`w-9 h-9 rounded border font-mono text-[11px] font-bold flex items-center justify-center hover:ring-2 hover:ring-destructive/50 transition-all ${info?.color || "bg-secondary text-foreground border-border"}`}
                            title="Click to remove"
                          >
                            {info?.label || "?"}
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
              {/* Classical bit label */}
              <span className="w-10 text-xs font-mono text-muted-foreground/50 text-right shrink-0">c[{q}]</span>
            </div>
          ))}
        </div>
        {gates.length === 0 && (
          <p className="text-center text-xs text-muted-foreground py-4">
            Drag gates from the palette onto qubit wires, or click a gate then click a wire
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>{numQubits} qubits</span>
        <span>{gates.length} gates</span>
        <span>Depth ~{columns.length}</span>
      </div>
    </div>
  );
}
