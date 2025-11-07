import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/stores/productStore";
import { Star } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

export const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={
            product.image ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
          }
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold">{product.name}</h3>
          <Badge
            variant={product.status === "Available" ? "default" : "secondary"}
            className="shrink-0"
          >
            {product.status}
          </Badge>
        </div>
        <p className="mb-2 text-sm text-muted-foreground">{product.brand}</p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">₹{product.price}</p>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{product.rating}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
