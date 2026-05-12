"use client";
import { ProductCard, ProductCardProps } from "./ProductCard";

export interface ProductCarouselProps {
    products: ProductCardProps[];
    onAddToCart?: (id: number) => void;
    onViewDetails?: (id: number) => void;
}

export function ProductCarousel({
    products,
    onAddToCart,
    onViewDetails,
}: ProductCarouselProps) {
    if (!products || products.length === 0) return null;

    return (
        <div className="w-full -mx-6 px-6 overflow-x-auto pb-4 scrollbar-hide flex gap-4 snap-x snap-mandatory">
            {products.map((product) => (
                <div key={product.id} className="snap-center">
                    <ProductCard
                        {...product}
                        onAddToCart={onAddToCart}
                        onViewDetails={onViewDetails}
                    />
                </div>
            ))}
            {/* End padding for scroll */}
            <div className="w-2 flex-shrink-0" />
        </div>
    );
}
