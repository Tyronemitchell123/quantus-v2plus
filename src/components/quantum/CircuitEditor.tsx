import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileCode, Sparkles } from "lucide-react";

const TEMPLATES = {
  bell: {
    label: "Bell State",
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0], q[1];
measure q[0] -> c[0];
measure q[1] -> c[1];`,
  },
  ghz: {
    label: "GHZ (3-qubit)",
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
cx q[0], q[1];
cx q[0], q[2];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];`,
  },
  random: {
    label: "Random Bitstring",
    code: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[4];
creg c[4];
h q[0];
h q[1];
h q[2];
h q[3];
measure q[0] -> c[0];
measure q[1] -> c[1];
measure q[2] -> c[2];
measure q[3] -> c[3];`,
  },
};

interface CircuitEditorProps {
  value: string;
  onChange: (v: string) => void;
}

export default function CircuitEditor({ value, onChange }: CircuitEditorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileCode size={16} className="text-quantum-cyan" />
          OpenQASM Circuit
        </label>
        <div className="flex gap-2">
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => onChange(t.code)}
              className="text-xs border-border hover:border-quantum-cyan/50 hover:text-quantum-cyan"
            >
              <Sparkles size={12} className="mr-1" />
              {t.label}
            </Button>
          ))}
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="OPENQASM 2.0;&#10;include &quot;qelib1.inc&quot;;&#10;..."
        className="font-mono text-sm min-h-[200px] bg-secondary/50 border-border focus:border-quantum-cyan/50"
        aria-label="OpenQASM circuit code"
      />
    </div>
  );
}
