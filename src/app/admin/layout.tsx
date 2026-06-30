import { ForceDarkMode } from "@/components/force-dark-mode";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ForceDarkMode />
      {children}
    </>
  );
}
