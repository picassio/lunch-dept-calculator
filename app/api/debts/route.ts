import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const debts = await prisma.debt.findMany({
      include: {
        debtor: true,
        creditor: true,
        menuItem: true,
      },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(debts);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch debts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { debtorId, creditorId, menuItemId, quantity, customPrice } = body;

    if (!debtorId || !creditorId || !menuItemId || !quantity) {
      return NextResponse.json(
        { error: 'Debtor, creditor, menu item, and quantity are required' },
        { status: 400 }
      );
    }

    // Get menu item price
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Use custom price if provided, otherwise use menu item's default price
    const pricePerItem = customPrice !== undefined ? customPrice : menuItem.price;
    const totalPrice = pricePerItem * quantity;

    const debt = await prisma.debt.create({
      data: {
        debtorId,
        creditorId,
        menuItemId,
        quantity,
        totalPrice,
      },
      include: {
        debtor: true,
        creditor: true,
        menuItem: true,
      },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create debt' },
      { status: 500 }
    );
  }
}

// Get total debts by user
export async function PUT() {
  try {
    const debts = await prisma.debt.groupBy({
      by: ['debtorId', 'creditorId'],
      _sum: {
        totalPrice: true,
      },
    });

    const debtSummaries = await Promise.all(
      debts.map(async (debt) => {
        const [debtor, creditor] = await Promise.all([
          prisma.user.findUnique({
            where: { id: debt.debtorId },
          }),
          prisma.user.findUnique({
            where: { id: debt.creditorId },
          }),
        ]);
        return {
          debtor,
          creditor,
          totalDebt: debt._sum.totalPrice,
        };
      })
    );

    return NextResponse.json(debtSummaries);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch total debts' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Debt ID is required' },
        { status: 400 }
      );
    }

    await prisma.debt.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({ message: 'Debt deleted successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete debt' },
      { status: 500 }
    );
  }
}