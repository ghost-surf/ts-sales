import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Receipt,
  FileText,
  Settings,
  BarChart3,
  Wrench,
  FolderOpen,
  Percent,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  History,
  Ban,
  Tags,
} from "lucide-react";

const navigation: Array<{ name: string; href: string; icon: typeof LayoutDashboard; roles?: UserRole[] }> = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Vendas", href: "/sales", icon: ShoppingCart },
  { name: "Faturas", href: "/invoices", icon: Receipt },
  { name: "Cotações", href: "/quotations", icon: FileText },
  { name: "Produtos", href: "/products", icon: Package },
  { name: "Categorias de Produtos", href: "/categories", icon: FolderOpen, roles: ["admin"] },
  { name: "Serviços", href: "/services", icon: Wrench, roles: ["admin"] },
  { name: "Categorias de Serviços", href: "/service-categories", icon: Tags, roles: ["admin"] },
  { name: "Impostos", href: "/taxes", icon: Percent, roles: ["admin"] },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Recibos", href: "/receipts", icon: Receipt },
  { name: "Notas de Crédito", href: "/credit-notes", icon: Ban },
  { name: "Utilizadores", href: "/users", icon: Settings, roles: ["admin"] },
  { name: "Relatórios", href: "/reports", icon: BarChart3, roles: ["admin"] },
  { name: "Movimentações de Stock", href: "/stock-movements", icon: History, roles: ["admin"] },
  { name: "Definições", href: "/settings", icon: Building2, roles: ["admin"] },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const visibleNavigation = navigation.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <div
      className={cn(
        "print:hidden bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h1 className="text-xl font-bold text-primary">TS Sales</h1>
              <p className="text-sm text-muted-foreground">Top Secret</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {visibleNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center"
              )}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border space-y-3">
        {!collapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout()}
          className={cn("w-full text-muted-foreground hover:text-foreground", collapsed ? "px-0" : "justify-start")}
        >
          <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
          {!collapsed && "Sair"}
        </Button>
      </div>
    </div>
  );
}
