import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";

const stockAlerts = [
  {
    id: 1,
    name: "Tubo 1/2\" Alta Pressão",
    currentStock: 15,
    minStock: 20,
    unit: "metros",
    category: "Tubos",
  },
  {
    id: 2,
    name: "Curva 90º 3/4\"",
    currentStock: 8,
    minStock: 15,
    unit: "pcs",
    category: "Conexões",
  },
  {
    id: 3,
    name: "Válvula de Esfera 1\"",
    currentStock: 3,
    minStock: 10,
    unit: "pcs",
    category: "Válvulas",
  },
  {
    id: 4,
    name: "Tubo 3/4\" Flexível",
    currentStock: 25.5,
    minStock: 50,
    unit: "metros",
    category: "Tubos",
  },
];

export function StockAlerts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span>Alertas de Stock</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stockAlerts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-warning/5 border border-warning/20 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="secondary" className="mb-1">
                  {product.currentStock} {product.unit}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Min: {product.minStock} {product.unit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}