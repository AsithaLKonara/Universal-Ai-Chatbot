"use client";
import { motion } from "framer-motion";
import { ShoppingCart, Check, Minus, Zap } from "lucide-react";
import { ComparisonResult } from "@/lib/commerce/comparison";

interface Props {
    data: ComparisonResult;
    onAddToCart?: (id: number) => void;
}

export function ComparisonCard({ data, onAddToCart }: Props) {
    if (!data || !data.productA || !data.productB) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white/5 border border-white/10 rounded-[24px] overflow-hidden backdrop-blur-md flex flex-col shadow-2xl my-4 text-sm"
        >
            {/* Header / Images */}
            <div className="flex bg-white/5">
                {[data.productA, data.productB].map((product, i) => (
                    <div key={product.id} className={`flex-1 p-4 flex flex-col items-center text-center ${i === 0 ? 'border-r border-white/5' : ''}`}>
                        <div className="w-16 h-16 rounded-xl overflow-hidden mb-3 bg-white/10">
                            <img src={product.image || "/placeholder-product.png"} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <h4 className="font-bold text-white line-clamp-2 text-xs h-8 mb-1">{product.name}</h4>
                        <span className="text-emerald-400 font-black mb-3">${product.price}</span>
                        <button
                            onClick={() => onAddToCart?.(product.id)}
                            className="w-full h-8 bg-white/10 text-white text-[10px] font-black uppercase tracking-wider rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-1.5"
                        >
                            <ShoppingCart size={12} /> Add
                        </button>
                    </div>
                ))}
            </div>

            {/* Comparison Dimensions */}
            <div className="flex flex-col divide-y divide-white/5">
                {data.dimensions.map((dim, idx) => (
                    <div key={idx} className="p-4">
                        <div className="text-center text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                            {dim.dimension}
                        </div>
                        <div className="flex justify-between items-start gap-4">
                            <div className={`flex-1 text-xs ${dim.winner === 'A' ? 'text-white font-medium' : 'text-white/60'}`}>
                                {dim.winner === 'A' && <Check size={12} className="inline mr-1 text-emerald-400" />}
                                {dim.winner === 'B' && <Minus size={12} className="inline mr-1 text-white/20" />}
                                {dim.valueA}
                            </div>
                            <div className="w-px bg-white/5 h-auto self-stretch" />
                            <div className={`flex-1 text-xs text-right ${dim.winner === 'B' ? 'text-white font-medium' : 'text-white/60'}`}>
                                {dim.valueB}
                                {dim.winner === 'B' && <Check size={12} className="inline ml-1 text-emerald-400" />}
                                {dim.winner === 'A' && <Minus size={12} className="inline ml-1 text-white/20" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Summary */}
            <div className="p-5 bg-gradient-to-br from-white/[0.08] to-transparent border-t border-white/5 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <Zap size={14} />
                </div>
                <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">AI Verdict</span>
                    <p className="text-white/80 text-xs leading-relaxed">{data.summary}</p>
                </div>
            </div>
        </motion.div>
    );
}
