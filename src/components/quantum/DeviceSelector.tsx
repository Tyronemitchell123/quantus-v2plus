import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Cpu } from "lucide-react";

const DEVICES = [
  { arn: "arn:aws:braket:::device/quantum-simulator/amazon/sv1", label: "SV1 State Vector Simulator", type: "simulator" },
  { arn: "arn:aws:braket:::device/quantum-simulator/amazon/tn1", label: "TN1 Tensor Network Simulator", type: "simulator" },
  { arn: "arn:aws:braket:::device/quantum-simulator/amazon/dm1", label: "DM1 Density Matrix Simulator", type: "simulator" },
  { arn: "arn:aws:braket:us-east-1::device/qpu/ionq/Aria-1", label: "IonQ Aria-1 (Trapped Ion)", type: "qpu" },
  { arn: "arn:aws:braket:eu-west-2::device/qpu/oqc/Lucy", label: "OQC Lucy (Superconducting)", type: "qpu" },
  { arn: "arn:aws:braket:us-west-1::device/qpu/rigetti/Aspen-M-3", label: "Rigetti Aspen-M-3", type: "qpu" },
];

interface DeviceSelectorProps {
  value: string;
  onChange: (v: string) => void;
  tier: string;
}

export default function DeviceSelector({ value, onChange, tier }: DeviceSelectorProps) {
  const isFreeTier = tier === "free";

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Cpu size={16} className="text-quantum-cyan" />
        Device
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-secondary/50 border-border">
          <SelectValue placeholder="Select a quantum device" />
        </SelectTrigger>
        <SelectContent>
          {DEVICES.map((d) => {
            const disabled = isFreeTier && d.type === "qpu";
            return (
              <SelectItem key={d.arn} value={d.arn} disabled={disabled}>
                <span className="flex items-center gap-2">
                  {d.label}
                  {d.type === "qpu" ? (
                    <Badge variant="outline" className="text-[10px] border-quantum-purple/50 text-quantum-purple">
                      QPU{disabled ? " · Paid" : ""}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-quantum-cyan/50 text-quantum-cyan">
                      Simulator
                    </Badge>
                  )}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {isFreeTier && (
        <p className="text-xs text-muted-foreground">
          Free tier: simulators only.{" "}
          <a href="/pricing" className="text-quantum-cyan hover:underline">Upgrade</a> for QPU access.
        </p>
      )}
    </div>
  );
}
