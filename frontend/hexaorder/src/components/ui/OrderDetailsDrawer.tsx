import { X,User} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Order } from "@/types";

interface Props {
    open: boolean;
    order?: Order | null;
    onClose: () => void;
}

export default function OrderDetailsDrawer({
    open,
    order,
    onClose,
}: Props) {

    if (!open || !order) return null;

    return (

        <div className="fixed inset-0 z-50 flex">

            {/* Overlay */}

            <div
                className="flex-1 bg-black/50"
                onClick={onClose}
            />

            {/* Drawer */}

            <div className="w-full max-w-xl bg-slate-900 border-l border-slate-700 shadow-2xl overflow-y-auto">

                <div className="flex items-center justify-between p-6 border-b border-slate-700">

                    <div>

                        <h2 className="text-xl font-bold text-white">

                            Order Details

                        </h2>

                        <p className="text-slate-400">

                            #{order.id}

                        </p>

                    </div>

                    <Button
                        variant="ghost"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5"/>
                    </Button>

                </div>

                <div className="p-6 space-y-6">

                    <section>

                        <h3 className="font-semibold text-white mb-3">

                            Order Information

                        </h3>

                        <div className="space-y-3">

                            <div className="flex justify-between">

                                <span className="text-slate-400">

                                    Status

                                </span>

                                <Badge variant="info">

                                    {order.status}

                                </Badge>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-400">

                                    Total

                                </span>

                                <span className="text-white font-semibold">

                                    ${order.totalAmount}

                                </span>

                            </div>

                            <div className="flex justify-between">

                                <span className="text-slate-400">

                                    Created

                                </span>

                                <span className="text-white">

                                    {new Date(order.createdAt).toLocaleString()}

                                </span>

                            </div>

                        </div>

                    </section>

                    <section>

                        <h3 className="font-semibold text-white mb-3">

                            Customer

                        </h3>

                        <div className="space-y-2">

                            <div className="flex gap-2">

                                <User className="w-4 h-4 text-brand-green"/>

                                <span className="text-white">

                                    {order.userEmail}

                                </span>

                            </div>

                        </div>

                    </section>

                    <section>

                        <h3 className="font-semibold text-white mb-3">

                            Products

                        </h3>

                        <div className="space-y-3">

                            {order.items.map(item => (

                                <div
                                    key={item.productId}
                                    className="border border-slate-700 rounded-xl p-4"
                                >

                                    <div className="flex justify-between">

                                        <span className="text-white">

                                            Product #{item.productId}

                                        </span>

                                        <span className="text-slate-300">

                                            Qty {item.quantity}

                                        </span>

                                    </div>

                                    <div className="mt-2 text-brand-green font-semibold">

                                        ${item.unitPrice}

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                </div>

            </div>

        </div>

    );

}