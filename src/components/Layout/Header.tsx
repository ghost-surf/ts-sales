import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/DataContext";
import { normalizeSearch } from "@/lib/utils";

const MAX_RESULTS_PER_GROUP = 5;

export function Header() {
  const { products, clients } = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const { matchedProducts, matchedClients } = useMemo(() => {
    const term = normalizeSearch(query.trim());
    if (!term) return { matchedProducts: [], matchedClients: [] };

    return {
      matchedProducts: products
        .filter((p) => normalizeSearch(p.name).includes(term))
        .slice(0, MAX_RESULTS_PER_GROUP),
      matchedClients: clients
        .filter((c) => normalizeSearch(c.name).includes(term))
        .slice(0, MAX_RESULTS_PER_GROUP),
    };
  }, [query, products, clients]);

  const hasResults = matchedProducts.length > 0 || matchedClients.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToProduct = (name: string) => {
    navigate(`/products?search=${encodeURIComponent(name)}`);
    setQuery("");
    setOpen(false);
  };

  const goToClient = (id: string) => {
    navigate(`/clients/${id}`);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (matchedProducts.length > 0) goToProduct(matchedProducts[0].name);
      else if (matchedClients.length > 0) goToClient(matchedClients[0].id);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <header className="print:hidden bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md relative" ref={containerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pesquisar produtos, clientes..."
              className="pl-10 bg-muted/50"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {open && query.trim() && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-80 overflow-y-auto">
              {!hasResults ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">Nenhum resultado encontrado</p>
              ) : (
                <>
                  {matchedProducts.length > 0 && (
                    <div className="py-1">
                      <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Produtos</p>
                      {matchedProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted"
                          onClick={() => goToProduct(product.name)}
                        >
                          <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{product.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {matchedClients.length > 0 && (
                    <div className="py-1 border-t border-border">
                      <p className="px-3 py-1 text-xs font-medium text-muted-foreground">Clientes</p>
                      {matchedClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted"
                          onClick={() => goToClient(client.id)}
                        >
                          <User className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="truncate">{client.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
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
