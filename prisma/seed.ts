import { PrismaClient, OrderStatus, PaymentType, SubstitutionPref } from "@prisma/client";
import { seedPharmacies, seedProducts } from "../src/lib/mock/seed";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { phone: "09120000000" },
    update: {},
    create: { phone: "09120000000", name: "کاربر دارونو" },
  });

  await prisma.address.upsert({
    where: { id: "addr-seed-home" },
    update: {},
    create: {
      id: "addr-seed-home",
      userId: user.id,
      label: "خانه",
      recipientName: "کاربر دارونو",
      phone: "09120000000",
      province: "تهران",
      city: "تهران",
      line1: "خیابان ولیعصر، پلاک ۱۲۳",
      postalCode: "1912345678",
      isDefault: true,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "ops@darunow.test" },
    update: { passwordHash: "admin123", role: "superAdmin" },
    create: { email: "ops@darunow.test", passwordHash: "admin123", role: "superAdmin" },
  });

  const pharmacyUser =
    (await prisma.pharmacyUser.findFirst({ where: { phone: "09120000001" } })) ||
    (await prisma.pharmacyUser.create({
      data: {
        phone: "09120000001",
        pharmacyId: seedPharmacies[0].id,
        role: "owner",
        passwordHash: "demo-pass",
      },
    }));

  for (const pharm of seedPharmacies) {
    await prisma.pharmacy.upsert({
      where: { id: pharm.id },
      update: {
        slug: pharm.slug,
        name: pharm.name,
        rating: pharm.rating,
        isOpen: pharm.isOpen,
        deliveryEtaMin: pharm.deliveryEtaMin,
        deliveryEtaMax: pharm.deliveryEtaMax,
        tags: pharm.tags,
        addressShort: pharm.addressShort,
        coverStyle: pharm.coverStyle,
        city: pharm.addressShort.split("،")[0] ?? "شهر",
      },
      create: {
        id: pharm.id,
        slug: pharm.slug,
        name: pharm.name,
        rating: pharm.rating,
        isOpen: pharm.isOpen,
        deliveryEtaMin: pharm.deliveryEtaMin,
        deliveryEtaMax: pharm.deliveryEtaMax,
        tags: pharm.tags,
        addressShort: pharm.addressShort,
        coverStyle: pharm.coverStyle,
        city: pharm.addressShort.split("،")[0] ?? "شهر",
      },
    });
  }

  for (const prod of seedProducts) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        pharmacyId: prod.pharmacyId,
        name: prod.nameFa,
        subtitle: prod.dosageFa,
        price: prod.priceToman,
        inStock: prod.stock > 0,
        description: prod.descriptionFa,
        category: prod.categoryFa,
      },
      create: {
        id: prod.id,
        pharmacyId: prod.pharmacyId,
        name: prod.nameFa,
        subtitle: prod.dosageFa,
        price: prod.priceToman,
        inStock: prod.stock > 0,
        description: prod.descriptionFa,
        category: prod.categoryFa,
      },
    });
  }

  // Seed a sample order for ops/testing
  const sampleOrder = await prisma.order.upsert({
    where: { id: "order-seed-1" },
    update: {
      timeline: [
        { status: "created", at: Date.now() - 1000 * 60 * 30 },
        { status: "preparing", at: Date.now() - 1000 * 60 * 5 },
      ],
      orderItems: {
        deleteMany: {},
        create: [
          {
            productId: seedProducts[0].id,
            name: seedProducts[0].nameFa,
            price: seedProducts[0].priceToman,
            qty: 1,
            subtitle: seedProducts[0].dosageFa,
          },
        ],
      },
    },
    create: {
      id: "order-seed-1",
      userId: user.id,
      pharmacyId: seedPharmacies[0].id,
      status: OrderStatus.preparing,
      subtotal: 185000,
      discount: 0,
      deliveryFee: 0,
      payable: 185000,
      paymentType: PaymentType.online,
      substitutionPref: SubstitutionPref.similarAllowed,
      addressId: "addr-seed-home",
      timeline: [
        { status: "created", at: Date.now() - 1000 * 60 * 30 },
        { status: "preparing", at: Date.now() - 1000 * 60 * 5 },
      ],
      orderItems: {
        create: [
          {
            productId: seedProducts[0].id,
            name: seedProducts[0].nameFa,
            price: seedProducts[0].priceToman,
            qty: 1,
            subtitle: seedProducts[0].dosageFa,
          },
        ],
      },
    },
  });

  await prisma.prescription.upsert({
    where: { id: "rx-seed-1" },
    update: {},
    create: {
      id: "rx-seed-1",
      userId: user.id,
      orderId: sampleOrder.id,
      pharmacyId: sampleOrder.pharmacyId,
      status: "review",
      fileType: "image",
      fileUrl: "https://example.com/rx-placeholder",
    },
  });

  await prisma.rating.upsert({
    where: { orderId_userId: { orderId: sampleOrder.id, userId: user.id } },
    update: {},
    create: {
      userId: user.id,
      orderId: sampleOrder.id,
      pharmacyId: sampleOrder.pharmacyId,
      score: 5,
      note: "سریع و دقیق",
    },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
