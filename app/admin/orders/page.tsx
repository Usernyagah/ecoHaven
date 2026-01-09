// === app/admin/orders/page.tsx ===

import { db } from '@/lib/db'
import { getUser } from '@/lib/auth/lucia'
import { redirect } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { revalidatePath } from 'next/cache'

async function updateOrderStatus(orderId: string, newStatus: any) {
    'use server'
    // Simple server action to update status
    await db.order.update({
        where: { id: orderId },
        data: { status: newStatus },
    })
    revalidatePath('/admin/orders')
}

export default async function AdminOrdersPage() {
    const { user } = await getUser()
    if (!user || user.role !== 'ADMIN') {
        redirect('/login')
    }

    const orders = await db.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { email: true, name: true },
            },
            orderItems: {
                select: { id: true }
            }
        },
    })

    return (
        <div className="container py-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-serif font-medium text-[#2c3e34]">Orders</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-stone-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-stone-50 hover:bg-stone-50">
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Items</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-mono text-xs">
                                        {order.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.user.name || 'Guest'}</span>
                                            <span className="text-xs text-muted-foreground">{order.user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        }).format(order.totalInCents / 100)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {order.orderItems.length}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {order.status === 'PAID' && (
                                            <form action={updateOrderStatus.bind(null, order.id, 'SHIPPED')}>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    Mark Shipped
                                                </Button>
                                            </form>
                                        )}
                                        {order.status === 'SHIPPED' && (
                                            <form action={updateOrderStatus.bind(null, order.id, 'DELIVERED')}>
                                                <Button size="sm" variant="secondary" className="h-8">
                                                    Mark Delivered
                                                </Button>
                                            </form>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        PAID: 'bg-green-100 text-green-800',
        SHIPPED: 'bg-blue-100 text-blue-800',
        DELIVERED: 'bg-stone-200 text-stone-800',
        CANCELLED: 'bg-red-100 text-red-800',
    }

    return (
        <Badge variant="outline" className={`${styles[status] || 'bg-gray-100'} border-none`}>
            {status}
        </Badge>
    )
}
