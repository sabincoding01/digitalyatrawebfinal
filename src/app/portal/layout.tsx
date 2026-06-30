import { ForceDarkMode } from "@/components/force-dark-mode";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceDarkMode />
      {children}
    </>
  );
}
