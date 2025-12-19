import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user (with isActive = true so they can login immediately)
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@papaye.com.gh" },
    update: { isActive: true, emailVerified: new Date() },
    create: {
      email: "admin@papaye.com.gh",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Create categories
  const categories = [
    { name: "Chicken", slug: "chicken", icon: "🍗", sortOrder: 1 },
    { name: "Fish", slug: "fish", icon: "🐟", sortOrder: 2 },
    { name: "Burgers", slug: "burgers", icon: "🍔", sortOrder: 3 },
    { name: "Extras", slug: "extras", icon: "🍟", sortOrder: 4 },
    { name: "Drinks", slug: "drinks", icon: "🥤", sortOrder: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categories created");

  // Get category IDs
  const chickenCat = await prisma.category.findUnique({ where: { slug: "chicken" } });
  const fishCat = await prisma.category.findUnique({ where: { slug: "fish" } });
  const burgersCat = await prisma.category.findUnique({ where: { slug: "burgers" } });
  const extrasCat = await prisma.category.findUnique({ where: { slug: "extras" } });
  const drinksCat = await prisma.category.findUnique({ where: { slug: "drinks" } });

  // Create menu items - Official Papaye Menu
  const menuItems = [
    {
      name: "Broasted Chicken Rice with Coleslaw",
      slug: "broasted-chicken-rice-coleslaw",
      categoryId: chickenCat!.id,
      price: 80.0,
      image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
      description: "Fried Chicken with Fried Rice, Pepper and Coleslaw",
      isPopular: true,
      prepTime: 15,
    },
    {
      name: "Broasted Chicken Chips with Coleslaw",
      slug: "broasted-chicken-chips-coleslaw",
      categoryId: chickenCat!.id,
      price: 80.0,
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
      description: "Fried Chicken with Fried Potato, Ketchup and Coleslaw",
      prepTime: 15,
    },
    {
      name: "Grilled Chicken Rice with Coleslaw",
      slug: "grilled-chicken-rice-coleslaw",
      categoryId: chickenCat!.id,
      price: 80.0,
      image: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop",
      description: "Charcoal Grilled Chicken with Fried Rice, Pepper and Coleslaw",
      isPopular: true,
      prepTime: 20,
    },
    {
      name: "Grilled Chicken Chips with Coleslaw",
      slug: "grilled-chicken-chips-coleslaw",
      categoryId: chickenCat!.id,
      price: 80.0,
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop",
      description: "Charcoal Grilled Chicken with Fried Potato, Pepper and Coleslaw",
      prepTime: 20,
    },
    {
      name: "Broasted Chicken Rice without Coleslaw",
      slug: "broasted-chicken-rice",
      categoryId: chickenCat!.id,
      price: 77.0,
      image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
      description: "Fried Chicken with Fried Rice and Pepper",
      prepTime: 15,
    },
    {
      name: "Mini Rice with Coleslaw",
      slug: "mini-rice-coleslaw",
      categoryId: chickenCat!.id,
      price: 40.0,
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop",
      description: "1pc Fried Chicken with Fried Rice, Pepper and Coleslaw",
      prepTime: 10,
    },
    {
      name: "Full Chicken",
      slug: "full-chicken",
      categoryId: chickenCat!.id,
      price: 135.0,
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop",
      description: "Full Roasted Chicken with pepper and vegetables",
      isPopular: true,
      prepTime: 25,
    },
    {
      name: "Grilled Fish Rice with Coleslaw",
      slug: "grilled-fish-rice-coleslaw",
      categoryId: fishCat!.id,
      price: 88.0,
      image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop",
      description: "Grilled Fish with Fried Rice, Pepper and Coleslaw",
      isPopular: true,
      prepTime: 25,
    },
    {
      name: "Grilled Fish Chips with Coleslaw",
      slug: "grilled-fish-chips-coleslaw",
      categoryId: fishCat!.id,
      price: 88.0,
      image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400&h=300&fit=crop",
      description: "Grilled Fish with Fried Potato, Ketchup and Coleslaw",
      prepTime: 25,
    },
    {
      name: "Fried Fish Rice with Coleslaw",
      slug: "fried-fish-rice-coleslaw",
      categoryId: fishCat!.id,
      price: 88.0,
      image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?w=400&h=300&fit=crop",
      description: "Fried Fish with Fried Rice, Pepper and Coleslaw",
      prepTime: 20,
    },
    {
      name: "Cheese Egg Burger",
      slug: "cheese-egg-burger",
      categoryId: burgersCat!.id,
      price: 70.0,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      description: "Burger Bread with Cheese, Egg, burger meat, lettuce, onion and tomatoes",
      isPopular: true,
      prepTime: 12,
    },
    {
      name: "Egg Burger",
      slug: "egg-burger",
      categoryId: burgersCat!.id,
      price: 70.0,
      image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop",
      description: "Burger Bread with Egg, burger meat, lettuce, onion and tomatoes",
      prepTime: 12,
    },
    {
      name: "Cheese Burger",
      slug: "cheese-burger",
      categoryId: burgersCat!.id,
      price: 65.0,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      description: "Burger Bread with Cheese, burger meat, lettuce, onion and tomatoes",
      prepTime: 12,
    },
    {
      name: "Beef Burger",
      slug: "beef-burger",
      categoryId: burgersCat!.id,
      price: 65.0,
      image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop",
      description: "Burger Bread with burger meat, lettuce, onion and tomatoes",
      prepTime: 12,
    },
    {
      name: "2pcs Extra Broasted Chicken",
      slug: "2pcs-extra-chicken",
      categoryId: extrasCat!.id,
      price: 41.0,
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop",
      description: "Two pieces of Fried Chicken",
      prepTime: 10,
    },
    {
      name: "3pcs Extra Broasted Chicken",
      slug: "3pcs-extra-chicken",
      categoryId: extrasCat!.id,
      price: 50.0,
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=400&h=300&fit=crop",
      description: "Three pieces of Fried Chicken and Pepper",
      prepTime: 10,
    },
    {
      name: "Coleslaw",
      slug: "coleslaw",
      categoryId: extrasCat!.id,
      price: 10.0,
      image: "https://images.unsplash.com/photo-1625938145744-e380515399bf?w=400&h=300&fit=crop",
      description: "Fresh creamy coleslaw made with cabbage and carrots",
      prepTime: 5,
    },
    {
      name: "French Fries",
      slug: "french-fries",
      categoryId: extrasCat!.id,
      price: 20.0,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop",
      description: "Crispy golden french fries, perfectly salted",
      prepTime: 8,
    },
    {
      name: "Fresh Juice",
      slug: "fresh-juice",
      categoryId: drinksCat!.id,
      price: 17.0,
      image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=300&fit=crop",
      description: "Fresh juice in three flavours: Orange, Pineapple and Tangerine",
      isPopular: true,
      prepTime: 5,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log("✅ Menu items created");

  // Create branches - Official Papaye Locations
  const branches = [
    {
      name: "Papaye Spintex (Head Office)",
      slug: "papaye-spintex",
      address: "Plot 53A, Spintex Road, Opp. Stanbic Bank, Accra",
      phone: "+233 302 810 992",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.6319,-0.1408&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.6319,
      longitude: -0.1408,
      isFeatured: true,
    },
    {
      name: "Papaye Osu",
      slug: "papaye-osu",
      address: "Oxford Street, Osu, Accra",
      phone: "+233 302 773 754",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.5598,-0.1828&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.5598,
      longitude: -0.1828,
      isFeatured: true,
    },
    {
      name: "Papaye Tesano",
      slug: "papaye-tesano",
      address: "Apenkwa, Tesano, Accra",
      phone: "+233 302 232 773",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.6066,-0.2356&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.6066,
      longitude: -0.2356,
      isFeatured: true,
    },
    {
      name: "Papaye Tema",
      slug: "papaye-tema",
      address: "Community 2, Meridian Road, Tema",
      phone: "+233 303 219 819",
      hours: "7:00 AM - 10:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.6698,-0.0167&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.6698,
      longitude: -0.0167,
      isFeatured: false,
    },
    {
      name: "Papaye Lapaz",
      slug: "papaye-lapaz",
      address: "Lapaz, Accra",
      phone: "+233 302 259 970",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.6050,-0.2456&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.6050,
      longitude: -0.2456,
      isFeatured: false,
    },
    {
      name: "Papaye Awudome",
      slug: "papaye-awudome",
      address: "North Kaneshie, Mother's Inn Roundabout, Awudome Estates",
      phone: "+233 302 267 703",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.5714,-0.2302&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.5714,
      longitude: -0.2302,
      isFeatured: false,
    },
    {
      name: "Papaye Haatso",
      slug: "papaye-haatso",
      address: "Haatso, Accra",
      phone: "+233 302 961 581",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.6672,-0.1871&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.6672,
      longitude: -0.1871,
      isFeatured: false,
    },
    {
      name: "Papaye Weija",
      slug: "papaye-weija",
      address: "Adjacent to West Hills Mall, Weija-Bortianor",
      phone: "+233 303 944 646",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.5463,-0.3464&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.5463,
      longitude: -0.3464,
      isFeatured: false,
    },
    {
      name: "Papaye Frafraha",
      slug: "papaye-frafraha",
      address: "Adenta-Dodowa Road, Frafraha",
      phone: "+233 342 295 406",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.7369,-0.1565&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.7369,
      longitude: -0.1565,
      isFeatured: false,
    },
    {
      name: "Papaye East Legon",
      slug: "papaye-east-legon",
      address: "East Legon, Accra",
      phone: "+233 342 295 420",
      hours: "7:00 AM - 11:00 PM",
      mapUrl: "https://maps.google.com/maps?q=5.6350,-0.1456&t=&z=15&ie=UTF8&iwloc=&output=embed",
      latitude: 5.6350,
      longitude: -0.1456,
      isFeatured: false,
    },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { slug: branch.slug },
      update: {},
      create: branch,
    });
  }
  console.log("✅ Branches created");

  // Create default settings
  const settings = [
    { key: "delivery_fee", value: "10" },
    { key: "min_order_amount", value: "50" },
    { key: "free_delivery_threshold", value: "100" },
    { key: "currency", value: "GH₵" },
    { key: "tax_rate", value: "0" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Settings created");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
