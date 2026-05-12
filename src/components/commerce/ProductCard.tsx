"use client";
import { motion } from "framer-motion";
import { ShoppingCart, Star, Info, ArrowRight } from "lucide-react";

export interface ProductCardProps {
    id: number;
    name: string;
    price: string;
    image: string;
    stock_status: string;
    explanation?: string;
    onAddToCart?: (id: number) => void;
    onViewDetails?: (id: number) => void;
}

export function ProductCard({
    id,
    name,
    price,
    image,
    stock_status,
    explanation,
    onAddToCart,
    onViewDetails,
}: ProductCardProps) {
    const isOutOfStock = stock_status === "outofstock";

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="flex-shrink-0 w-[240px] bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md flex flex-col group shadow-2xl"
        >
            {/* Image Container */}
            <div className="relative h-[180px] overflow-hidden bg-white/5">
                <img
                    src={image || "/placeholder-product.png"}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {explanation && (
                    <div className="absolute top-3 left-3 right-3">
                        <div className="bg-emerald-500/90 backdrop-blur-md text-[10px] text-white px-2.5 py-1 rounded-full font-black uppercase tracking-wider shadow-lg">
                            {explanation}
                        </div>
                    </div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white border border-white/20 px-3 py-1.5 rounded-full">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-2">
                <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                        {name}
                    </h4>
                    <span className="text-emerald-400 font-black text-sm whitespace-nowrap">
                        ${price}
                    </span>
                </div>

                <div className="flex items-center gap-1 opacity-50">
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    <Star size={10} className="fill-yellow-500 text-yellow-500" />
                    <Star size={10} className="text-white" />
                    <span className="text-[10px] ml-1 font-bold">4.8</span>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-3 flex gap-2">
                    <button
                        onClick={() => onAddToCart?.(id)}
                        disabled={isOutOfStock}
                        className="flex-1 h-9 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:scale-100"
                    >
                        <ShoppingCart size={14} />
                        Add
                    </button>
                    <button
                        onClick={() => onViewDetails?.(id)}
                        className="w-9 h-9 border border-white/10 text-white hover:bg-white/5 rounded-xl flex items-center justify-center transition-all"
                    >
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
