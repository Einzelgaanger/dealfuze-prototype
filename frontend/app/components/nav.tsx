import { Home, User, Briefcase, FileText, Settings } from "lucide-react";
import { NavBar as TubelightNavBar } from "@/components/ui/tubelight-navbar";

export function NavBar() {
  const navItems = [
    { name: "Pipelines", url: "#", icon: Home },
    { name: "Settings", url: "#", icon: Settings },
  ];

  return <TubelightNavBar items={navItems} />;
}
