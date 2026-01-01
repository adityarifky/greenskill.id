'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  MoreHorizontal,
  LayoutTemplate,
  BookOpen,
  Eye,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dasbor' },
  { href: '/dashboard/schemes', icon: FileText, label: 'Skema Registrasi' },
  { href: '/dashboard/offers', icon: FileText, label: 'Daftar Surat' },
  { href: '/dashboard/modules', icon: BookOpen, label: 'Daftar Modul' },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient) {
    // You can return a loader or an empty fragment here
    return null;
  }


  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
           <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Greenskill</span>
          </div>
          <SidebarTrigger>
            <MoreHorizontal />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={
                      (item.href === '/dashboard' && pathname === item.href) ||
                      (item.href !== '/dashboard' && pathname.startsWith(item.href))
                    }
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
