import {
  InventoryStatus,
  OrderStatus,
  PaymentType,
  PrismaClient,
  PromoType,
  SubstitutionPref,
} from "@prisma/client";
import { seedPharmacies, seedProducts } from "../src/lib/mock/seed";

const prisma = new PrismaClient();

type DrugSeed = {
  id: string;
  nameFa: string;
  nameEn?: string;
  genericName?: string;
  brandName?: string;
  atcCode?: string;
  isRxRequired: boolean;
  descriptionLite?: string;
  warningsLite?: string;
  synonyms: string[];
};

type InventorySeed = {
  id: string;
  pharmacyId: string;
  drugId: string;
  price: number;
  stockQty: number;
  status: InventoryStatus;
};

const cityCenters: Record<string, { lat: number; lng: number }> = {
  تهران: { lat: 35.6892, lng: 51.389 },
  کرج: { lat: 35.8327, lng: 50.9915 },
  اصفهان: { lat: 32.6546, lng: 51.6675 },
  شیراز: { lat: 29.5918, lng: 52.5837 },
  مشهد: { lat: 36.2605, lng: 59.6168 },
  تبریز: { lat: 38.0962, lng: 46.2738 },
};

function normalizeCity(addressShort?: string | null): string {
  if (!addressShort) return "تهران";
  const parts = addressShort.split(/[،,]/);
  const city = parts[0]?.trim();
  return city && city.length > 0 ? city : "تهران";
}

function baseDescription(nameFa: string): string {
  return `${nameFa} - اطلاعات عمومی و خلاصه. قبل از مصرف با داروساز یا پزشک مشورت کنید.`;
}

function buildDrugSeeds(): DrugSeed[] {
  const drugs: DrugSeed[] = [];
  const seen = new Set<string>();

  seedProducts.forEach((prod) => {
    const key = prod.nameFa.trim();
    if (seen.has(key)) return;
    seen.add(key);
    const id = `drug-prod-${String(drugs.length + 1).padStart(3, "0")}`;
    drugs.push({
      id,
      nameFa: prod.nameFa,
      nameEn: prod.nameFa,
      genericName: prod.categoryFa,
      brandName: prod.nameFa,
      isRxRequired: Boolean(prod.rxRequired),
      descriptionLite: prod.descriptionFa ? `${prod.descriptionFa} | با داروساز/پزشک مشورت کنید.` : baseDescription(prod.nameFa),
      warningsLite: (prod.warningsFa ?? []).join("؛ ") || "طبق دستور پزشک مصرف شود.",
      synonyms: [prod.nameFa, prod.dosageFa, prod.categoryFa].filter(Boolean) as string[],
    });
  });

  const templates: Omit<DrugSeed, "id" | "descriptionLite" | "warningsLite" | "synonyms">[] = [
    { nameFa: "متفورمین", nameEn: "Metformin", genericName: "Metformin", brandName: "Glucophage", atcCode: "A10BA02", isRxRequired: true },
    { nameFa: "سیتریزین", nameEn: "Cetirizine", genericName: "Cetirizine", brandName: "Zyrtec", atcCode: "R06AE07", isRxRequired: false },
    { nameFa: "سرترالین", nameEn: "Sertraline", genericName: "Sertraline", brandName: "Zoloft", atcCode: "N06AB06", isRxRequired: true },
    { nameFa: "لورازپام", nameEn: "Lorazepam", genericName: "Lorazepam", brandName: "Ativan", atcCode: "N05BA06", isRxRequired: true },
    { nameFa: "فروکتوزآهن", nameEn: "Ferrous sulfate", genericName: "Iron", brandName: "Ferrose", atcCode: "B03AA07", isRxRequired: false },
    { nameFa: "لوزارتان", nameEn: "Losartan", genericName: "Losartan", brandName: "Cozaar", atcCode: "C09CA01", isRxRequired: true },
    { nameFa: "اترواستاتین", nameEn: "Atorvastatin", genericName: "Atorvastatin", brandName: "Lipitor", atcCode: "C10AA05", isRxRequired: true },
    { nameFa: "لووتیروکسین", nameEn: "Levothyroxine", genericName: "Levothyroxine", brandName: "Euthyrox", atcCode: "H03AA01", isRxRequired: true },
    { nameFa: "آلبوترول استنشاقی", nameEn: "Albuterol", genericName: "Salbutamol", brandName: "Ventolin", atcCode: "R03AC02", isRxRequired: true },
    { nameFa: "لانزوپرازول", nameEn: "Lansoprazole", genericName: "Lansoprazole", brandName: "Prevacid", atcCode: "A02BC03", isRxRequired: false },
    { nameFa: "کلاریترومایسین", nameEn: "Clarithromycin", genericName: "Clarithromycin", brandName: "Klaricid", atcCode: "J01FA09", isRxRequired: true },
    { nameFa: "فلوکونازول", nameEn: "Fluconazole", genericName: "Fluconazole", brandName: "Diflucan", atcCode: "J02AC01", isRxRequired: true },
    { nameFa: "پنتوپرازول", nameEn: "Pantoprazole", genericName: "Pantoprazole", brandName: "Protonix", atcCode: "A02BC02", isRxRequired: false },
    { nameFa: "سالبوتامول خوراکی", nameEn: "Salbutamol", genericName: "Salbutamol", brandName: "Ventolin", atcCode: "R03CC02", isRxRequired: true },
    { nameFa: "سالمترول", nameEn: "Salmeterol", genericName: "Salmeterol", brandName: "Serevent", atcCode: "R03AC12", isRxRequired: true },
    { nameFa: "آزیترومایسین", nameEn: "Azithromycin", genericName: "Azithromycin", brandName: "Zithromax", atcCode: "J01FA10", isRxRequired: true },
    { nameFa: "ملوکسیکام", nameEn: "Meloxicam", genericName: "Meloxicam", brandName: "Mobic", atcCode: "M01AC06", isRxRequired: false },
    { nameFa: "کلداکل", nameEn: "Cold Combination", genericName: "Cold Relief", brandName: "Coldat", atcCode: "R05X", isRxRequired: false },
    { nameFa: "کورتیزن کرم", nameEn: "Hydrocortisone", genericName: "Hydrocortisone", brandName: "Cortizone", atcCode: "D07AA02", isRxRequired: false },
    { nameFa: "فلوکساسین", nameEn: "Levofloxacin", genericName: "Levofloxacin", brandName: "Tavanic", atcCode: "J01MA12", isRxRequired: true },
  ];

  const variants = ["200mg", "400mg", "500mg", "کپسول", "شربت"];
  for (const template of templates) {
    for (const variant of variants) {
      if (drugs.length >= 100) break;
      const id = `drug-${String(drugs.length + 1).padStart(3, "0")}`;
      const nameFa = `${template.nameFa} ${variant}`;
      const description = baseDescription(template.nameFa);
      const warnings = "طبق دستور پزشک مصرف شود و در صورت علائم غیرمعمول، مشورت کنید.";
      const synonyms = [
        template.nameFa,
        template.nameEn,
        template.genericName,
        template.brandName,
        variant,
      ].filter(Boolean) as string[];
      drugs.push({
        ...template,
        id,
        nameFa,
        descriptionLite: description,
        warningsLite: warnings,
        synonyms,
      });
    }
    if (drugs.length >= 100) break;
  }

  return drugs.slice(0, 100);
}

function stockStatus(stockQty: number): InventoryStatus {
  if (stockQty <= 0) return InventoryStatus.out;
  if (stockQty < 5) return InventoryStatus.low;
  return InventoryStatus.in_stock;
}

function buildInventorySeeds(drugs: DrugSeed[]): InventorySeed[] {
  const items: InventorySeed[] = [];
  seedPharmacies.forEach((pharmacy, idx) => {
    const start = (idx * 9) % drugs.length;
    const count = 15 + (idx % 4);
    for (let i = 0; i < count; i += 1) {
      const drug = drugs[(start + i) % drugs.length];
      const numeric = Number(drug.id.replace(/\D/g, "")) || i + 1;
      const stockQty = (numeric * (idx + 5)) % 55;
      const price = 65000 + ((numeric * 137 + idx * 23) % 250000);
      items.push({
        id: `inv-${pharmacy.id}-${drug.id}`,
        pharmacyId: pharmacy.id,
        drugId: drug.id,
        price,
        stockQty,
        status: stockStatus(stockQty),
      });
    }
  });
  return items;
}

function buildCoverageSeeds() {
  return seedPharmacies.map((pharm, idx) => {
    const city = normalizeCity(pharm.addressShort);
    const center = cityCenters[city] ?? cityCenters["تهران"];
    const jitter = (idx % 3) * 0.01;
    return {
      id: `cov-${pharm.id}`,
      pharmacyId: pharm.id,
      city,
      polygonJson: null as any,
      radiusKm: 6 + (idx % 4),
      centerLat: center.lat + jitter,
      centerLng: center.lng + jitter,
    };
  });
}

function buildHoursSeeds(pharmacyId: string, pharmacyIndex: number) {
  const hours: {
    id: string;
    pharmacyId: string;
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[] = [];
  for (let day = 0; day < 7; day += 1) {
    const isFriday = day === 5;
    const closed = isFriday && pharmacyIndex % 3 === 0;
    hours.push({
      id: `hrs-${pharmacyId}-${day}`,
      pharmacyId,
      dayOfWeek: day,
      openTime: closed ? "00:00" : isFriday ? "10:00" : "08:30",
      closeTime: closed ? "00:00" : isFriday ? "19:00" : "22:30",
      isClosed: closed,
    });
  }
  return hours;
}

function buildPromoRuleSeeds() {
  const now = Date.now();
  return [
    {
      id: "promo-welcome-10",
      code: "WELCOME10",
      type: PromoType.percent,
      value: 10,
      minBasket: 150_000,
      maxDiscount: 60_000,
      expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 30),
      isActive: true,
    },
    {
      id: "promo-rx-50k",
      code: "RX50K",
      type: PromoType.fixed,
      value: 50_000,
      minBasket: 250_000,
      maxDiscount: null,
      expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 14),
      isActive: true,
    },
    {
      id: "promo-city-15",
      code: "CITY15",
      type: PromoType.percent,
      value: 15,
      minBasket: 300_000,
      maxDiscount: 90_000,
      expiresAt: new Date(now + 1000 * 60 * 60 * 24 * 45),
      isActive: true,
    },
    {
      id: "promo-ops-20",
      code: "OPS20",
      type: PromoType.percent,
      value: 20,
      minBasket: 200_000,
      maxDiscount: 110_000,
      expiresAt: null,
      isActive: false,
    },
  ];
}

function buildFeeConfigSeeds() {
  const uniqueCities = Array.from(
    new Set(seedPharmacies.map((p) => normalizeCity(p.addressShort))),
  );
  const defaults = {
    baseDeliveryFee: 25_000,
    perKmFee: 4_000,
    serviceFee: 12_000,
    freeDeliveryMinBasket: 450_000,
  };
  return uniqueCities.map((city, idx) => ({
    id: `fee-${city}-${idx}`,
    city,
    baseDeliveryFee: defaults.baseDeliveryFee + idx * 1_000,
    perKmFee: defaults.perKmFee + idx * 200,
    serviceFee: defaults.serviceFee,
    freeDeliveryMinBasket: defaults.freeDeliveryMinBasket + idx * 10_000,
  }));
}

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
    const city = normalizeCity(pharm.addressShort);
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
        city,
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
        city,
      },
    });
  }

  const drugs = buildDrugSeeds();
  for (const drug of drugs) {
    await prisma.drug.upsert({
      where: { id: drug.id },
      update: {
        nameFa: drug.nameFa,
        nameEn: drug.nameEn,
        genericName: drug.genericName,
        brandName: drug.brandName,
        atcCode: drug.atcCode,
        isRxRequired: drug.isRxRequired,
        descriptionLite: drug.descriptionLite,
        warningsLite: drug.warningsLite,
      },
      create: {
        id: drug.id,
        nameFa: drug.nameFa,
        nameEn: drug.nameEn,
        genericName: drug.genericName,
        brandName: drug.brandName,
        atcCode: drug.atcCode,
        isRxRequired: drug.isRxRequired,
        descriptionLite: drug.descriptionLite,
        warningsLite: drug.warningsLite,
      },
    });
    await prisma.drugSynonym.deleteMany({ where: { drugId: drug.id } });
    if (drug.synonyms.length > 0) {
      await prisma.drugSynonym.createMany({
        data: drug.synonyms.map((term, idx) => ({
          id: `${drug.id}-syn-${idx}`,
          drugId: drug.id,
          term,
        })),
        skipDuplicates: true,
      });
    }
  }

  const inventorySeeds = buildInventorySeeds(drugs);
  for (const item of inventorySeeds) {
    await prisma.inventoryItem.upsert({
      where: { id: item.id },
      update: {
        pharmacyId: item.pharmacyId,
        drugId: item.drugId,
        price: item.price,
        stockQty: item.stockQty,
        status: item.status,
      },
      create: {
        id: item.id,
        pharmacyId: item.pharmacyId,
        drugId: item.drugId,
        price: item.price,
        stockQty: item.stockQty,
        status: item.status,
      },
    });
  }

  const drugIndex = new Map(drugs.map((d) => [d.id, d]));
  const productSeeds = inventorySeeds.map((item) => {
    const drug = drugIndex.get(item.drugId)!;
    const category = drug.genericName ?? drug.brandName ?? "عمومی";
    const subtitle = drug.brandName && drug.brandName !== drug.nameFa ? drug.brandName : drug.genericName ?? "";
    return {
      id: `prod-${item.id}`,
      pharmacyId: item.pharmacyId,
      drugId: item.drugId,
      name: drug.nameFa,
      subtitle,
      price: item.price,
      inStock: item.status !== InventoryStatus.out,
      description: drug.descriptionLite ?? baseDescription(drug.nameFa),
      category,
    };
  });

  for (const prod of productSeeds) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        pharmacyId: prod.pharmacyId,
        drugId: prod.drugId,
        name: prod.name,
        subtitle: prod.subtitle,
        price: prod.price,
        inStock: prod.inStock,
        description: prod.description,
        category: prod.category,
      },
      create: {
        id: prod.id,
        pharmacyId: prod.pharmacyId,
        drugId: prod.drugId,
        name: prod.name,
        subtitle: prod.subtitle,
        price: prod.price,
        inStock: prod.inStock,
        description: prod.description,
        category: prod.category,
      },
    });
  }

  const coverageSeeds = buildCoverageSeeds();
  for (const cov of coverageSeeds) {
    await prisma.pharmacyCoverage.upsert({
      where: { id: cov.id },
      update: {
        pharmacyId: cov.pharmacyId,
        city: cov.city,
        polygonJson: cov.polygonJson,
        radiusKm: cov.radiusKm,
        centerLat: cov.centerLat,
        centerLng: cov.centerLng,
      },
      create: {
        id: cov.id,
        pharmacyId: cov.pharmacyId,
        city: cov.city,
        polygonJson: cov.polygonJson,
        radiusKm: cov.radiusKm,
        centerLat: cov.centerLat,
        centerLng: cov.centerLng,
      },
    });
  }

  for (const [idx, pharm] of seedPharmacies.entries()) {
    const hours = buildHoursSeeds(pharm.id, idx);
    await prisma.pharmacyHours.deleteMany({ where: { pharmacyId: pharm.id } });
    await prisma.pharmacyHours.createMany({ data: hours, skipDuplicates: true });
  }

  const promoSeeds = buildPromoRuleSeeds();
  for (const promo of promoSeeds) {
    await prisma.promoRule.upsert({
      where: { id: promo.id },
      update: {
        code: promo.code,
        type: promo.type,
        value: promo.value,
        minBasket: promo.minBasket,
        maxDiscount: promo.maxDiscount,
        expiresAt: promo.expiresAt,
        isActive: promo.isActive,
      },
      create: {
        id: promo.id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
        minBasket: promo.minBasket,
        maxDiscount: promo.maxDiscount,
        expiresAt: promo.expiresAt,
        isActive: promo.isActive,
      },
    });
  }

  const feeSeeds = buildFeeConfigSeeds();
  for (const fee of feeSeeds) {
    await prisma.feeConfig.upsert({
      where: { city: fee.city },
      update: {
        baseDeliveryFee: fee.baseDeliveryFee,
        perKmFee: fee.perKmFee,
        serviceFee: fee.serviceFee,
        freeDeliveryMinBasket: fee.freeDeliveryMinBasket,
      },
      create: {
        id: fee.id,
        city: fee.city,
        baseDeliveryFee: fee.baseDeliveryFee,
        perKmFee: fee.perKmFee,
        serviceFee: fee.serviceFee,
        freeDeliveryMinBasket: fee.freeDeliveryMinBasket,
      },
    });
  }

  const sampleProduct = productSeeds.find((p) => p.pharmacyId === seedPharmacies[0].id && p.inStock) ?? productSeeds[0];
  const now = Date.now();
  const orderGroup = await prisma.orderGroup.upsert({
    where: { id: "og-seed-1" },
    update: {},
    create: { id: "og-seed-1", userId: user.id },
  });

  const sampleOrder = await prisma.order.upsert({
    where: { id: "order-seed-1" },
    update: {
      orderGroupId: orderGroup.id,
      pharmacyId: sampleProduct.pharmacyId,
      timeline: [
        { status: "created", at: now - 1000 * 60 * 30 },
        { status: "preparing", at: now - 1000 * 60 * 5 },
      ],
      orderItems: {
        deleteMany: {},
        create: [
          {
            productId: sampleProduct.id,
            name: sampleProduct.name,
            price: sampleProduct.price,
            qty: 1,
            subtitle: sampleProduct.subtitle,
          },
        ],
      },
    },
    create: {
      id: "order-seed-1",
      userId: user.id,
      orderGroupId: orderGroup.id,
      pharmacyId: sampleProduct.pharmacyId,
      status: OrderStatus.preparing,
      subtotal: sampleProduct.price,
      discount: 0,
      deliveryFee: 0,
      payable: sampleProduct.price,
      paymentType: PaymentType.online,
      substitutionPref: SubstitutionPref.similarAllowed,
      addressId: "addr-seed-home",
      timeline: [
        { status: "created", at: now - 1000 * 60 * 30 },
        { status: "preparing", at: now - 1000 * 60 * 5 },
      ],
      orderItems: {
        create: [
          {
            productId: sampleProduct.id,
            name: sampleProduct.name,
            price: sampleProduct.price,
            qty: 1,
            subtitle: sampleProduct.subtitle,
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
