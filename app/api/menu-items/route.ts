import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      orderBy: { name: 'asc' },
      include: {
        restaurant: true
      }
    });
    
    // Also fetch restaurants for the form dropdown
    const restaurants = await prisma.restaurant.findMany({
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json({ menuItems, restaurants });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, price, category, restaurantId } = body;

    if (!name || !price || !category || !restaurantId) {
      return NextResponse.json(
        { error: 'Name, price, category, and restaurant are required' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        price: parseFloat(price),
        category,
        restaurantId: parseInt(restaurantId)
      },
      include: {
        restaurant: true
      }
    });

    return NextResponse.json(menuItem, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, price, category, restaurantId } = body;

    if (!id || !name || !price || !category || !restaurantId) {
      return NextResponse.json(
        { error: 'ID, name, price, category, and restaurant are required' },
        { status: 400 }
      );
    }

    const menuItem = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        category,
        restaurantId: parseInt(restaurantId)
      },
      include: {
        restaurant: true
      }
    });

    return NextResponse.json(menuItem);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update menu item' },
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
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    await prisma.menuItem.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
}