import { PrismaClient, Role, FuelType, VehicleType, BookingStatus, SlotStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const staffEmail = process.env['SEED_STAFF_EMAIL'] ?? 'staff@example.com';
  const staffPass = process.env['SEED_STAFF_PASSWORD'] ?? 'ChangeMe123';
  const staffHash = await bcrypt.hash(staffPass, 12);

  const staff = await prisma.user.upsert({
    where: { email: staffEmail.toLowerCase() },
    update: { passwordHash: staffHash, role: Role.STAFF, isActive: true },
    create: {
      email: staffEmail.toLowerCase(),
      passwordHash: staffHash,
      fullName: 'System Staff Admin',
      phone: '+923001234567',
      role: Role.STAFF,
      isActive: true,
    },
  });
  console.log(`Staff user ready: ${staff.email}`);

  const customerHash = await bcrypt.hash('Demo1234', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { passwordHash: customerHash, role: Role.CUSTOMER, isActive: true },
    create: {
      email: 'demo@example.com',
      passwordHash: customerHash,
      fullName: 'Zain Demo Customer',
      phone: '+923219876543',
      role: Role.CUSTOMER,
      isActive: true,
    },
  });
  console.log(`Customer user ready: ${customer.email}`);

  const dealershipsData = [
    {
      name: 'Aurum Drive Central',
      city: 'Karachi',
      address: 'Plot 14-C, Main Shahrah-e-Faisal, PECHS Block 6',
      phone: '+922134567890',
      email: 'karachi@aurumdrive.example',
      openingTime: '09:00',
      closingTime: '18:00',
      description: 'Flagship coastal showroom with private VIP lounge and enclosed delivery bays.',
    },
    {
      name: 'Aurum Drive Lahore Heritage',
      city: 'Lahore',
      address: '22-A, Gulberg III, MM Alam Road',
      phone: '+924235678901',
      email: 'lahore@aurumdrive.example',
      openingTime: '09:00',
      closingTime: '19:00',
      description: 'Exclusive pavilion featuring bespoke customisation studios and dedicated test-track.',
    },
    {
      name: 'Aurum Drive Capital',
      city: 'Islamabad',
      address: 'Diplomatic Enclave Road, Sector G-5/2',
      phone: '+92512345678',
      email: 'islamabad@aurumdrive.example',
      openingTime: '09:00',
      closingTime: '18:00',
      description: 'Executive boutique dealership catering to diplomats and luxury connoisseurs.',
    },
  ];

  const dealerships = [];
  for (const d of dealershipsData) {
    const record = await prisma.dealership.upsert({
      where: { name_city: { name: d.name, city: d.city } },
      update: d,
      create: d,
    });
    dealerships.push(record);
  }
  console.log(`Seeded ${dealerships.length} dealerships`);

  const vehiclesData = [
    {
      dIndex: 0,
      manufacturer: 'Mercedes-Benz',
      model: 'S-Class S 580 4MATIC',
      year: 2024,
      type: VehicleType.SEDAN,
      fuelType: FuelType.HYBRID,
      transmission: '9G-TRONIC Automatic',
      engine: '4.0L V8 Biturbo with Mild Hybrid',
      powerHp: 496,
      topSpeedKmh: 250,
      acceleration0to100: 4.4,
      seats: 5,
      color: 'Obsidian Black Metallic',
      priceUsd: 128000,
      description: 'The pinnacle of luxury motoring featuring active ambient lighting, executive rear seating, and AIRMATIC air suspension.',
      features: ['E-ACTIVE BODY CONTROL', 'Burmester 4D Sound', 'Rear Axle Steering', 'Nappa Leather', 'HUD Augmented Reality'],
      imageUrls: ['/placeholders/mercedes-s580.svg'],
    },
    {
      dIndex: 0,
      manufacturer: 'Porsche',
      model: '911 Carrera 4S',
      year: 2024,
      type: VehicleType.SPORTS,
      fuelType: FuelType.PETROL,
      transmission: '8-speed Porsche Doppelkupplung (PDK)',
      engine: '3.0L Twin-Turbo Boxer 6',
      powerHp: 443,
      topSpeedKmh: 306,
      acceleration0to100: 3.4,
      seats: 4,
      color: 'Gentian Blue Metallic',
      priceUsd: 140000,
      description: 'Iconic silhouettes engineered for precision track response, everyday usability, and acoustic exhilaration.',
      features: ['Sport Chrono Package', 'Porsche Ceramic Composite Brake', 'PASM Sport Suspension', 'Sport Exhaust System'],
      imageUrls: ['/placeholders/porsche-911.svg'],
    },
    {
      dIndex: 0,
      manufacturer: 'BMW',
      model: 'i7 xDrive60',
      year: 2024,
      type: VehicleType.SEDAN,
      fuelType: FuelType.ELECTRIC,
      transmission: 'Single-Speed Automatic',
      engine: 'Dual Electric Motors',
      powerHp: 536,
      topSpeedKmh: 240,
      acceleration0to100: 4.5,
      seats: 5,
      color: 'Mineral White Metallic',
      priceUsd: 120000,
      description: 'All-electric forward-thinking luxury with 31.3-inch rear BMW Theater Screen and crystal glass interior accents.',
      features: ['BMW Theater Screen', 'Iconic Glow Kidney Grille', 'Executive Lounge Seating', 'Driving Assistant Professional'],
      imageUrls: ['/placeholders/bmw-i7.svg'],
    },
    {
      dIndex: 0,
      manufacturer: 'Audi',
      model: 'RS e-tron GT',
      year: 2024,
      type: VehicleType.SEDAN,
      fuelType: FuelType.ELECTRIC,
      transmission: '2-speed rear axle transmission',
      engine: 'Permanently Excited Synchronous Motors',
      powerHp: 637,
      topSpeedKmh: 250,
      acceleration0to100: 3.1,
      seats: 5,
      color: 'Daytona Gray Pearl',
      priceUsd: 147000,
      description: 'Electrified grand tourer sculpture combining thrilling launch control dynamics with daily serenity.',
      features: ['Carbon Roof', 'Bang & Olufsen 3D Sound', 'Tungsten Carbide Brakes', 'Matrix LED with Laser Light'],
      imageUrls: ['/placeholders/audi-rs-etron.svg'],
    },
    {
      dIndex: 1,
      manufacturer: 'Range Rover',
      model: 'Autobiography P530',
      year: 2024,
      type: VehicleType.SUV,
      fuelType: FuelType.PETROL,
      transmission: '8-speed Automatic with CommandShift',
      engine: '4.4L Twin-Turbocharged V8',
      powerHp: 523,
      topSpeedKmh: 261,
      acceleration0to100: 4.6,
      seats: 5,
      color: 'Belgravia Green',
      priceUsd: 168000,
      description: 'Peerless composure and modern luxury refinement designed to glide over any terrain.',
      features: ['All-Wheel Steering', 'Meridian Signature Sound', 'SV Bespoke Interior', 'Cabin Air Purification Pro'],
      imageUrls: ['/placeholders/range-rover-autobio.svg'],
    },
    {
      dIndex: 1,
      manufacturer: 'Bentley',
      model: 'Continental GT V8',
      year: 2023,
      type: VehicleType.COUPE,
      fuelType: FuelType.PETROL,
      transmission: '8-speed Dual Clutch',
      engine: '4.0L Twin-Turbo V8',
      powerHp: 542,
      topSpeedKmh: 318,
      acceleration0to100: 3.9,
      seats: 4,
      color: 'Glacier White',
      priceUsd: 238000,
      description: 'Handcrafted British automotive masterpiece matching athletic grandeur with bookmatched open-pore wood veneers.',
      features: ['Bentley Rotating Display', 'Mulliner Driving Specification', 'Naim for Bentley Audio', 'Diamond-in-Diamond Quilting'],
      imageUrls: ['/placeholders/bentley-gt.svg'],
    },
    {
      dIndex: 1,
      manufacturer: 'Aston Martin',
      model: 'DBX707',
      year: 2024,
      type: VehicleType.SUV,
      fuelType: FuelType.PETROL,
      transmission: '9-speed wet-clutch automatic',
      engine: '4.0L Twin-Turbo V8',
      powerHp: 697,
      topSpeedKmh: 310,
      acceleration0to100: 3.3,
      seats: 5,
      color: 'Apex Grey',
      priceUsd: 242000,
      description: 'The world’s most powerful luxury SUV, blending uncompromised supercar velocity with elevated comfort.',
      features: ['Carbon Ceramic Brakes', 'Electronic Active Roll Control', 'Sport Plus Seats', 'Gloss Black Exterior Pack'],
      imageUrls: ['/placeholders/aston-dbx707.svg'],
    },
    {
      dIndex: 1,
      manufacturer: 'Mercedes-Benz',
      model: 'G 63 AMG 4MATIC',
      year: 2024,
      type: VehicleType.SUV,
      fuelType: FuelType.PETROL,
      transmission: 'AMG SPEEDSHIFT PLUS 9G-TRONIC',
      engine: '4.0L V8 Biturbo Handcrafted',
      powerHp: 577,
      topSpeedKmh: 240,
      acceleration0to100: 4.5,
      seats: 5,
      color: 'G manufaktur Night Black Magno',
      priceUsd: 180000,
      description: 'Timeless utilitarian silhouette elevated to high-performance icon with side-exit sports exhaust.',
      features: ['AMG Ride Control', 'Three Differential Locks', 'AMG Carbon Trim', 'Burmester Surround Sound'],
      imageUrls: ['/placeholders/mercedes-g63.svg'],
    },
    {
      dIndex: 2,
      manufacturer: 'Porsche',
      model: 'Taycan Turbo S Cross Turismo',
      year: 2024,
      type: VehicleType.HATCHBACK,
      fuelType: FuelType.ELECTRIC,
      transmission: '2-speed rear / 1-speed front',
      engine: 'Permanent Magnet Synchronous Motors',
      powerHp: 750,
      topSpeedKmh: 250,
      acceleration0to100: 2.7,
      seats: 5,
      color: 'Chalk',
      priceUsd: 197000,
      description: 'Electric soul unbound with off-road package, gravel mode, and breathtaking hypercar acceleration.',
      features: ['Off-Road Design Package', 'Porsche Active Ride', 'Rear Seat Entertainment', 'Panoramic Fixed Glass Roof'],
      imageUrls: ['/placeholders/porsche-taycan-cross.svg'],
    },
    {
      dIndex: 2,
      manufacturer: 'Lexus',
      model: 'LC 500 Convertible',
      year: 2024,
      type: VehicleType.CONVERTIBLE,
      fuelType: FuelType.PETROL,
      transmission: '10-speed Direct-Shift Automatic',
      engine: '5.0L Naturally Aspirated V8',
      powerHp: 471,
      topSpeedKmh: 270,
      acceleration0to100: 4.6,
      seats: 4,
      color: 'Infrared Metallic',
      priceUsd: 106000,
      description: 'Glorious naturally aspirated V8 symphonic open-top cruiser with four-layer lightweight soft top.',
      features: ['Yamaha Performance Damper', 'Mark Levinson Reference Audio', 'Neck Heaters in Headrests', 'Semi-Aniline Leather'],
      imageUrls: ['/placeholders/lexus-lc500.svg'],
    },
    {
      dIndex: 2,
      manufacturer: 'BMW',
      model: 'M8 Competition Gran Coupe',
      year: 2024,
      type: VehicleType.COUPE,
      fuelType: FuelType.PETROL,
      transmission: '8-speed M Steptronic with Drivelogic',
      engine: '4.4L M TwinPower Turbo V8',
      powerHp: 617,
      topSpeedKmh: 305,
      acceleration0to100: 3.1,
      seats: 5,
      color: 'Isle of Man Green',
      priceUsd: 138000,
      description: 'Four-door performance flagship delivering devastating M xDrive traction and bespoke Merino leather sanctuary.',
      features: ['M Carbon Ceramic Brakes', 'Bowers & Wilkins Diamond Surround', 'M Carbon Bucket Seats', 'Laserlight Headlamps'],
      imageUrls: ['/placeholders/bmw-m8-gran.svg'],
    },
    {
      dIndex: 2,
      manufacturer: 'Tesla',
      model: 'Model S Plaid',
      year: 2024,
      type: VehicleType.SEDAN,
      fuelType: FuelType.ELECTRIC,
      transmission: 'Single-Speed Fixed Gear',
      engine: 'Tri-Motor All-Wheel Drive',
      powerHp: 1020,
      topSpeedKmh: 322,
      acceleration0to100: 2.1,
      seats: 5,
      color: 'Ultra Red',
      priceUsd: 90000,
      description: 'Carbon-sleeved rotors producing over 1,000 hp for mind-bending quarter-mile speeds.',
      features: ['Tri-Motor Torque Vectoring', 'Yoke Steering', '22-Speaker 960W Audio', '17-inch Cinematic Screen'],
      imageUrls: ['/placeholders/tesla-model-s.svg'],
    },
  ];

  const vehicles = [];
  for (const v of vehiclesData) {
    const dealershipId = dealerships[v.dIndex]!.id;
    const existing = await prisma.vehicle.findFirst({
      where: {
        dealershipId,
        manufacturer: v.manufacturer,
        model: v.model,
      },
    });

    const payload = {
      dealershipId,
      manufacturer: v.manufacturer,
      model: v.model,
      year: v.year,
      type: v.type,
      fuelType: v.fuelType,
      transmission: v.transmission,
      engine: v.engine,
      powerHp: v.powerHp,
      topSpeedKmh: v.topSpeedKmh,
      acceleration0to100: v.acceleration0to100,
      seats: v.seats,
      color: v.color,
      priceUsd: v.priceUsd,
      description: v.description,
      features: v.features,
      imageUrls: v.imageUrls,
      isAvailable: true,
      isActive: true,
    };

    if (existing) {
      const updated = await prisma.vehicle.update({ where: { id: existing.id }, data: payload });
      vehicles.push(updated);
    } else {
      const created = await prisma.vehicle.create({ data: payload });
      vehicles.push(created);
    }
  }
  console.log(`Seeded ${vehicles.length} luxury vehicles`);

  // Future active slots for next 14 days
  const now = new Date();
  let createdSlotsCount = 0;
  const sampleVehicle = vehicles[0]!;

  for (let day = 1; day <= 14; day++) {
    const slotTimes = [
      { startHour: 10, endHour: 11 },
      { startHour: 12, endHour: 13 },
      { startHour: 14, endHour: 15 },
      { startHour: 16, endHour: 17 },
    ];

    for (const st of slotTimes) {
      const startsAt = new Date(now);
      startsAt.setDate(now.getDate() + day);
      startsAt.setHours(st.startHour, 0, 0, 0);

      const endsAt = new Date(now);
      endsAt.setDate(now.getDate() + day);
      endsAt.setHours(st.endHour, 0, 0, 0);

      await prisma.timeSlot.upsert({
        where: {
          vehicleId_startsAt: {
            vehicleId: sampleVehicle.id,
            startsAt,
          },
        },
        update: { endsAt, status: SlotStatus.ACTIVE },
        create: {
          vehicleId: sampleVehicle.id,
          dealershipId: sampleVehicle.dealershipId,
          startsAt,
          endsAt,
          status: SlotStatus.ACTIVE,
        },
      });
      createdSlotsCount++;
    }
  }
  console.log(`Generated ${createdSlotsCount} slots for sample vehicle`);

  // Sample booking
  const firstSlot = await prisma.timeSlot.findFirst({
    where: { vehicleId: sampleVehicle.id, status: SlotStatus.ACTIVE },
    orderBy: { startsAt: 'asc' },
  });

  if (firstSlot) {
    const existingBooking = await prisma.booking.findFirst({
      where: { slotId: firstSlot.id },
    });

    if (!existingBooking) {
      const booking = await prisma.booking.create({
        data: {
          customerId: customer.id,
          slotId: firstSlot.id,
          status: BookingStatus.PENDING,
          customerNote: 'Excited to test the ride quality on the highway.',
        },
      });

      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          toStatus: BookingStatus.PENDING,
          changedById: customer.id,
          note: 'Booking requested by customer',
        },
      });

      await prisma.notification.create({
        data: {
          userId: customer.id,
          bookingId: booking.id,
          type: 'BOOKING_CREATED',
          title: 'Booking Request Received',
          message: 'Your test-drive request has been received and is pending dealership approval.',
        },
      });
      console.log('Sample booking & notification created.');
    }
  }

  console.log('Database seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

