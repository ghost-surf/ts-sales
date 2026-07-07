import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { useData } from "@/contexts/DataContext";

export function StockAlerts() {
  const { products } = useData();
  const lowStockProducts = products
    .filter((product) => product.stock <= product.lowStockThreshold)
    .slice(0, 6);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>Alertas de Stock</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum produto com stock baixo
          </p>
        ) : (
          <div className="space-y-4">
            {lowStockProducts.map((product) => (
              <Link
                key={product.id}
                to={`/products?search=${encodeURIComponent(product.name)}`}
                className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg hover:bg-warning/10 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                    <Package className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground hover:text-primary hover:underline">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="mb-1">
                    {product.stock} {product.unit}
                  </Badge>
                  <p className="text-xs text-muted-foreground">
                    Min: {product.lowStockThreshold} {product.unit}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
