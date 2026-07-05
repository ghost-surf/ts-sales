import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/DataContext";

export function Header() {
  const { products } = useData();
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  return (
    <header className="print:hidden bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar produtos, clientes..."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Stock Alert */}
          {lowStockCount > 0 && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-warning/10 border border-warning/20 rounded-md">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span className="text-sm text-warning-foreground">
                {lowStockCount} produto{lowStockCount > 1 ? "s" : ""} em stock baixo
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
