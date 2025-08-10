import { Department } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Props {
  department: Department;
  onViewStaff: (deptId: string) => void;
  onSetAsFrom: (deptId: string) => void;
  onSetAsTo: (deptId: string) => void;
}

const DepartmentPopup = ({ department, onViewStaff, onSetAsFrom, onSetAsTo }: Props) => {
  return (
    <div className="min-w-[260px] max-w-[360px]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold leading-none mb-1">{department.name}</h3>
          <p className="text-sm text-muted-foreground">{department.type}</p>
        </div>
        <Badge>{department.code}</Badge>
      </div>

      <Separator className="my-3" />

      <p className="text-sm text-muted-foreground mb-3">
        {department.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {department.facilities.map((f) => (
          <Badge key={f.name} variant={f.available ? "secondary" : "outline"}>
            {f.name}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" onClick={() => onViewStaff(department.id)}>View Staff</Button>
        <Button size="sm" variant="secondary" onClick={() => onSetAsFrom(department.id)}>From</Button>
        <Button size="sm" variant="secondary" onClick={() => onSetAsTo(department.id)}>To</Button>
      </div>
    </div>
  );
};

export default DepartmentPopup;
