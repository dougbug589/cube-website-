'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Newspaper, Briefcase, Bell, FolderKanban,
  FileSpreadsheet, FlaskConical, Users, Image as ImageIcon,
  ShieldAlert, Settings, LogOut, ExternalLink, Menu, X, Inbox, Archive
} from 'lucide-react';
import { getCurrentAdmin, logoutAdminAction } from '@/app/admin/actions/auth';
import FloatingCubeBackground from '@/components/admin/FloatingCubeBackground';
import RealtimeRefresher from '@/components/admin/RealtimeRefresher';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isVerifying, setIsVerifying] = useState(pathname !== '/admin/login');
  const [adminUser, setAdminUser] = useState<{
    fullName: string;
    email: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsVerifying(false);
      return;
    }

    let active = true;
    getCurrentAdmin()
      .then((session) => {
        if (!active) return;
        if (session) {
          setAdminUser({
            fullName: session.fullName,
            email: session.email,
            role: session.role,
          });
          setIsVerifying(false);
        } else {
          // If no session token, redirect immediately to login page
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        if (active) {
          router.replace('/admin/login');
        }
      });
    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#F7F7F4] flex flex-col items-center justify-center font-sans text-[#24272B]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-3 border-[#070E5C] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#747B83] uppercase tracking-wider">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    // Instant client-side redirect for zero delay
    window.location.href = '/admin/login';
    // Clean up server session in background
    logoutAdminAction().catch(() => {});
  };

  const navItems = [
    { label: 'Overview Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Technical & CEL Enquiries', href: '/admin/enquiries', icon: Inbox, badge: 'Realtime' },
    { label: 'News & Press', href: '/admin/news', icon: Newspaper, badge: 'Live' },
    { label: 'Announcements & Popup', href: '/admin/announcements', icon: Bell, badge: 'Active' },
    { label: 'Projects Portfolio', href: '/admin/projects', icon: FolderKanban },
    { label: 'Hiring & Careers', href: '/admin/careers', icon: Briefcase },
    { label: 'Tenders & Notices', href: '/admin/tenders', icon: FileSpreadsheet },
    { label: 'CEL Environmental Lab', href: '/admin/cel', icon: FlaskConical },
    { label: 'Leadership & Team', href: '/admin/team', icon: Users },
    { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
    { label: 'Central Archive Vault', href: '/admin/archive', icon: Archive, badge: 'Protected' },
    { label: 'Security & Audit Logs', href: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'CMS Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F4] flex flex-col md:flex-row font-sans text-[#24272B] relative">
      <RealtimeRefresher />
      <FloatingCubeBackground />
      
      {/* Mobile Top Header - Clean Light Architectural Bar */}
      <div className="md:hidden bg-white border-b border-[#E5E7EB] text-[#24272B] p-4 flex items-center justify-between z-30">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-[#F7F7F4] border border-[#E5E7EB] text-[#24272B]"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="relative h-8 w-36">
            <Image
              src="/images/branding/cube-admin-logo.png"
              alt="CUBE"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="px-3 py-1.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] font-semibold text-xs flex items-center hover:bg-[#D99A42] hover:text-white transition"
        >
          <span>Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>

      {/* Architectural Light Sidebar with Stable Full-Height Flex Flow */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-40 w-64 bg-white text-[#24272B] flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#E5E7EB] shadow-sm shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo Brand Header - Fixed at Top */}
          <div className="p-5 border-b border-[#E5E7EB] bg-white shrink-0">
            <div className="relative h-12 w-full mb-2">
              <Image
                src="/images/branding/cube-clean-transparent.png"
                alt="CUBE Institutional Admin"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#D99A42] font-bold uppercase tracking-wider px-1">
              <span>Admin Operations Desk</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Nav Items - Smooth Full-Height Scrolling Without Trailing Blank Margin */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all active:scale-[0.99] ${
                    isActive
                      ? 'bg-[#EAF2F8] text-[#070E5C] font-bold border border-[#BBD6EA] shadow-sm'
                      : 'hover:bg-[#F7F7F4] text-[#4A5568] hover:text-[#24272B]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#070E5C]' : 'text-[#D99A42]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                        isActive
                          ? 'bg-[#070E5C] text-white'
                          : 'bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Institutional Isometric Artwork in Sidebar - Stable Anchor */}
          <div className="px-4 py-3 mx-3 mb-2 rounded-2xl bg-gradient-to-br from-[#EAF2F8]/70 via-[#F7F7F4] to-[#FAF4E6]/50 border border-[#BBD6EA]/60 shadow-2xs relative overflow-hidden shrink-0">
            <div className="flex items-center space-x-3 relative z-10">
              <div className="relative h-12 w-12 shrink-0">
                <Image
                  src="/images/branding/cube-3d-isometric-logo.png"
                  alt="CUBE Institutional Emblem Artwork"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-serif font-bold text-[#070E5C] truncate">
                  Centre for Urbanization
                </div>
                <div className="text-[9px] text-[#6B7280] leading-tight truncate">
                  Buildings &amp; Environment
                </div>
                <div className="text-[8px] font-bold text-[#D99A42] uppercase tracking-wider mt-0.5">
                  IITM &bull; Govt of TN
                </div>
              </div>
            </div>
            
            {/* Subtle architectural watermark ring */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-[#D99A42]/10 blur-sm pointer-events-none" />
          </div>
        </div>

        {/* User Footnote & Logout - Fixed at Bottom */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#FAFAFA] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-full bg-[#EAF2F8] border border-[#BBD6EA] flex items-center justify-center text-[#070E5C] font-bold text-xs uppercase">
                {adminUser?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-[#24272B] truncate max-w-[110px]">
                  {adminUser?.fullName || 'Loading...'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
                  {adminUser?.email || ''}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition cursor-pointer active:scale-95 disabled:opacity-50"
              title="Sign Out"
            >
              {loggingOut ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#EAF2F8] text-[#24272B] hover:text-[#070E5C] border border-[#E5E7EB] text-xs font-semibold flex items-center justify-center space-x-1.5 transition shadow-2xs"
          >
            <span>Preview Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D99A42]" />
          </Link>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen">
        {/* Top Desktop Bar */}
        <header className="hidden md:flex h-16 bg-white border-b border-[#E5E7EB] px-8 items-center justify-between sticky top-0 z-20 shadow-2xs">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-1 rounded-md border border-[#BBD6EA]">
              CUBE CMS Realtime
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-[#4A5568] font-medium">
              IIT Madras &bull; Government of Tamil Nadu
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              <span>Realtime Live Synced</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto relative z-10">
          {children}
        </div>
      </main>

    </div>
  );
}
