import { useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getDepartmentStaff, StaffMember } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import jsPDF from "jspdf";

interface StaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departmentId?: string;
  departmentName?: string;
}

const StaffModal = ({ open, onOpenChange, departmentId, departmentName }: StaffModalProps) => {
  const { data: staff = [], refetch, isFetching } = useQuery<StaffMember[]>({
    queryKey: ["staff", departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      return getDepartmentStaff(departmentId);
    },
    enabled: !!departmentId && open,
  });

  useEffect(() => {
    if (open && departmentId) refetch();
  }, [open, departmentId, refetch]);

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    let y = 64;
    doc.setFontSize(16);
    doc.text(`Staff List — ${departmentName || "Department"}`, marginX, y);
    y += 24;
    doc.setFontSize(11);

    staff.forEach((s, idx) => {
      if (y > 780) {
        doc.addPage();
        y = 64;
      }
      doc.text(`${idx + 1}. ${s.name} — ${s.designation}`, marginX, y);
      y += 16;
      doc.text(`Qualification: ${s.qualification}`, marginX, y);
      y += 14;
      doc.text(`Email: ${s.email}`, marginX, y);
      y += 18;
      doc.line(marginX, y, 560, y);
      y += 12;
    });

    doc.save(`${departmentName || "department"}-staff.pdf`);
  };

  const title = useMemo(() => departmentName ? `${departmentName} — Faculty` : "Faculty Members", [departmentName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Showing {staff.length} members</p>
          <Button onClick={exportPdf} variant="secondary">Export PDF</Button>
        </div>
        <Separator />
        <ScrollArea className="h-[420px] pr-4">
          <ul className="space-y-3">
            {staff.map((s) => (
              <li key={s.id} className="rounded-md border bg-card p-3">
                <div className="flex items-start gap-3">
                  <img src={s.photo_url} alt={`${s.name} photo`} loading="lazy" className="size-12 rounded-md object-cover" />
                  <div>
                    <p className="font-medium leading-tight">{s.name}</p>
                    <p className="text-sm text-muted-foreground">{s.designation} • {s.qualification}</p>
                    <a href={`mailto:${s.email}`} className="text-sm text-primary underline mt-1 inline-block">{s.email}</a>
                  </div>
                </div>
              </li>
            ))}
            {!isFetching && staff.length === 0 && (
              <li className="text-sm text-muted-foreground">No staff found.</li>
            )}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StaffModal;
