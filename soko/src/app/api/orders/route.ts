export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    // Read body properly
    const body = await req.json();
    const { productId, quantity, deliveryOption, note } = body;

    if (!productId || !quantity) {
      return NextResponse.json({ error: 'Product and quantity are required.' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.active) {
      return NextResponse.json({ error: 'Product is not available.' }, { status: 404 });
    }
    if (product.quantity < quantity) {
      return NextResponse.json({ error: `Only ${product.quantity} in stock.` }, { status: 400 });
    }

    const sellPrice = product.price;
    const totalPrice = sellPrice * quantity;

    const order = await prisma.order.create({
      data: {
        customerId: userId,
        businessId: product.businessId,
        totalPrice,
        deliveryOption: deliveryOption || 'CUSTOMER_PICKUP',
        note: note || null,
        status: 'NEW',
        items: {
          create: [{ 
            productId: product.id, 
            quantity, 
            price: sellPrice, 
            costPrice: product.costPrice || 0 
          }],
        },
      },
      include: { items: true },
    });

    // Update product quantity
    await prisma.product.update({
      where: { id: product.id },
      data: { quantity: { decrement: quantity } },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order. Please try again.' },
      { status: 500 }
    );
  }
}