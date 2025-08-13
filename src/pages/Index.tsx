import { useEffect, useMemo, useState } from "react";
import CollegeMap from "@/components/map/CollegeMap";
import StaffModal from "@/components/StaffModal";
import { getDepartments, Department, DepartmentType } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Mic, Loader2 } from "lucide-react";
const Index = () => {
  const { data: departments = [] } = useQuery<Department[]>({ queryKey: ["departments"], queryFn: getDepartments });

  const [search, setSearch] = useState("");
  const [type, setType] = useState<DepartmentType | "All">("All");
  const [selectedDept, setSelectedDept] = useState<Department | undefined>();
  const [staffOpen, setStaffOpen] = useState(false);
  const [fromId, setFromId] = useState<string | undefined>();
  const [toId, setToId] = useState<string | undefined>();
  const [recording, setRecording] = useState(false);

  const record3s = async (): Promise<Blob> => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    recorder.start();
    setTimeout(() => recorder.stop(), 3000);
    await stopped;
    stream.getTracks().forEach((t) => t.stop());

    return new Blob(chunks, { type: 'audio/webm' });
  };

  const startVoiceSearch = async () => {
    try {
      setRecording(true);
      const blob = await record3s();
      const form = new FormData();
      form.append('audio', blob, 'audio.webm');

      const resp = await fetch('http://localhost:5000/stt', {
        method: 'POST',
        body: form,
      });

      const data = await resp.json();
      if (data?.text) {
        setSearch(data.text);
      }
    } catch (err) {
      console.error('Voice search failed', err);
    } finally {
      setRecording(false);
    }
  };

  useEffect(() => {
    document.title = "College Navigator — Campus Map & Departments";
  }, []);
  const filtered = useMemo(() => {
    return departments.filter((d) => {
      const matchType = type === "All" || d.type === type;
      const q = search.trim().toLowerCase();
      const matchText = !q || d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q);
      return matchType && matchText;
    });
  }, [departments, search, type]);

  const stats = useMemo(() => {
    const total = departments.length;
    const faculty = departments.reduce((a, b) => a + (b.faculty_count || 0), 0);
    const eng = departments.filter((d) => d.type === "Engineering").length;
    return { total, faculty, eng };
  }, [departments]);

  const openStaff = (deptId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    setSelectedDept(dept);
    setStaffOpen(true);
  };

  const resetRoute = () => {
    setFromId(undefined);
    setToId(undefined);
  };

  return (
    <div className="container mx-auto py-6">
      <header className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">College Navigator</h1>
          <p className="text-sm text-muted-foreground">Find your way around campus</p>
        </div>
        <div className="flex items-center gap-2 w-full max-w-xl">
          <div className="relative w-full">
            <Input
              placeholder="Search departments, blocks"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
              className="pr-10"
            />
            <button
              type="button"
              onClick={startVoiceSearch}
              disabled={recording}
              aria-label={recording ? 'Listening…' : 'Voice search'}
              title={recording ? 'Listening…' : 'Voice search'}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {recording ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
              <span className="sr-only">Voice search</span>
            </button>
          </div>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <aside className="md:col-span-4 lg:col-span-3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campus Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Navigate through our campus easily. Click on any department marker or use the search to find specific locations.
              </p>
              {selectedDept && (
                <div>
                  <Separator className="my-2" />
                  <p className="text-sm font-medium">Selected Department</p>
                  <p className="text-sm">{selectedDept.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDept.type} • {selectedDept.faculty_count} Faculty Members</p>
                  {selectedDept.image_urls?.length > 0 && (
                    <div className="mt-3">
                      <Carousel className="w-full">
                        <CarouselContent>
                          {selectedDept.image_urls.map((src, idx) => (
                            <CarouselItem key={idx}>
                              <AspectRatio ratio={16/9}>
                                <img src={src} alt={`${selectedDept.name} image ${idx + 1}`} loading="lazy" className="h-full w-full rounded-md object-cover" />
                              </AspectRatio>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    </div>
                  )}
                  <div className="mt-3">
                    <Button size="sm" onClick={() => setStaffOpen(true)}>View Staff Details</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span>Total Departments</span><span className="font-semibold">{stats.total}</span></div>
                <div className="flex items-center justify-between"><span>Faculty Members</span><span className="font-semibold">{stats.faculty}</span></div>
                <div className="flex items-center justify-between"><span>Engineering Depts</span><span className="font-semibold">{stats.eng}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get Directions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={fromId} onValueChange={setFromId}>
                <SelectTrigger><SelectValue placeholder="From (select department)" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={toId} onValueChange={setToId}>
                <SelectTrigger><SelectValue placeholder="To (select department)" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={resetRoute} className="flex-1">Clear</Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="md:col-span-8 lg:col-span-9">
          <CollegeMap
            departments={filtered}
            onMarkerClick={(d) => setSelectedDept(d)}
            fromId={fromId}
            toId={toId}
            onSetFrom={(id) => setFromId(id)}
            onSetTo={(id) => setToId(id)}
            onViewStaff={(id) => {
              const dept = departments.find((x) => x.id === id);
              setSelectedDept(dept);
              setStaffOpen(true);
            }}
          />
        </section>
      </main>

      <StaffModal
        open={staffOpen}
        onOpenChange={setStaffOpen}
        departmentId={selectedDept?.id}
        departmentName={selectedDept?.name}
      />
    </div>
  );
};

export default Index;
