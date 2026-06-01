import process from "node:process";
// Use require with ts-ignore to avoid TypeScript module resolution error during build
// (some environments don't emit a declaration for ./db). Runtime still requires the module.
// @ts-ignore
const { pool } = require("./db");
import bcrypt from "bcryptjs";

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 12, (err, hash) => {
      if (err || !hash) return reject(err || new Error("Hashing failed"));
      resolve(hash);
    });
  });
}

async function columnExists(table: string, column: string) {
  const [rows] = await pool.execute(
    `
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE LOWER(TABLE_SCHEMA) = LOWER(DATABASE())
      AND LOWER(TABLE_NAME) = LOWER(?)
      AND LOWER(COLUMN_NAME) = LOWER(?)
    LIMIT 1
    `,
    [table, column]
  );

  return (rows as any[]).length > 0;
}

async function addColumnIfMissing(
  table: string,
  column: string,
  definition: string
) {
  if (await columnExists(table, column)) return;

  try {
    await pool.execute(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`
    );
  } catch (error: any) {
    if (error?.code !== "ER_DUP_FIELDNAME") throw error;
  }
}

async function tableExists(table: string) {
  const [rows] = await pool.execute(
    `
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.TABLES
    WHERE LOWER(TABLE_SCHEMA) = LOWER(DATABASE())
      AND LOWER(TABLE_NAME) = LOWER(?)
    LIMIT 1
    `,
    [table]
  );

  return (rows as any[]).length > 0;
}

async function indexExists(table: string, indexName: string) {
  const [rows] = await pool.execute(
    `
    SELECT INDEX_NAME
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE LOWER(TABLE_SCHEMA) = LOWER(DATABASE())
      AND LOWER(TABLE_NAME) = LOWER(?)
      AND LOWER(INDEX_NAME) = LOWER(?)
    LIMIT 1
    `,
    [table, indexName]
  );

  return (rows as any[]).length > 0;
}

async function foreignKeyExists(table: string, constraintName: string) {
  const [rows] = await pool.execute(
    `
    SELECT CONSTRAINT_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE LOWER(TABLE_SCHEMA) = LOWER(DATABASE())
      AND LOWER(TABLE_NAME) = LOWER(?)
      AND LOWER(CONSTRAINT_NAME) = LOWER(?)
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
    `,
    [table, constraintName]
  );

  return (rows as any[]).length > 0;
}

async function dropForeignKeyIfExists(table: string, constraintName: string) {
  if (!(await foreignKeyExists(table, constraintName))) return;
  await pool.execute(`ALTER TABLE ${table} DROP FOREIGN KEY ${constraintName}`);
}

async function addForeignKeyIfMissing(
  table: string,
  constraintName: string,
  definition: string
) {
  if (await foreignKeyExists(table, constraintName)) return;
  await pool.execute(`ALTER TABLE ${table} ADD CONSTRAINT ${constraintName} ${definition}`);
}

async function addUniqueKeyIfMissing(table: string, indexName: string, columns: string) {
  if (await indexExists(table, indexName)) return;

  if (table.toLowerCase() === "services" && indexName.toLowerCase() === "services_slug_unique") {
    await pool.execute(`
      DELETE t1 FROM services t1
      INNER JOIN services t2 
      ON t1.slug = t2.slug AND t1.id > t2.id
    `);
  }

  await pool.execute(
    `ALTER TABLE ${table} ADD UNIQUE KEY ${indexName} (${columns})`
  );
}

async function selectColumnOrDefault(table: string, column: string, fallback: string) {
  return (await columnExists(table, column)) ? column : fallback;
}

export async function ensureDatabaseSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      last_login_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY admins_email_unique (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NULL,
      email VARCHAR(180) NULL,
      phone VARCHAR(24) NULL,
      mobile VARCHAR(24) NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'customer',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("users", "name", "VARCHAR(120) NULL");
  await addColumnIfMissing("users", "email", "VARCHAR(180) NULL");
  await addColumnIfMissing("users", "phone", "VARCHAR(24) NULL");
  await addColumnIfMissing("users", "mobile", "VARCHAR(24) NULL");
  await addColumnIfMissing("users", "role", "VARCHAR(50) NOT NULL DEFAULT 'customer'");
  await addColumnIfMissing("users", "status", "VARCHAR(50) NOT NULL DEFAULT 'active'");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vendors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NULL,
      business_name VARCHAR(255) NULL,
      city VARCHAR(255) NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("vendors", "email", "VARCHAR(180) NULL");
  await addColumnIfMissing("vendors", "phone", "VARCHAR(24) NULL");
  await addColumnIfMissing("vendors", "password_hash", "VARCHAR(255) NULL");
  await addColumnIfMissing("vendors", "category", "VARCHAR(100) NULL");
  await addColumnIfMissing("vendors", "experience", "VARCHAR(80) NULL");
  await addColumnIfMissing("vendors", "description", "TEXT NULL");
  await addColumnIfMissing("vendors", "profile_image", "VARCHAR(255) NULL");
  await addColumnIfMissing("vendors", "social_links", "JSON NULL");
  await addColumnIfMissing("vendors", "remember_token", "VARCHAR(120) NULL");
  await addColumnIfMissing("vendors", "password_reset_token", "VARCHAR(255) NULL");
  await addColumnIfMissing("vendors", "password_reset_expires_at", "DATETIME NULL");
  await addColumnIfMissing("vendors", "last_login_at", "DATETIME NULL");
  await addColumnIfMissing(
    "vendors",
    "updated_at",
    "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
  await pool.execute(`
    UPDATE vendors v
    SET v.status = 'pending'
    WHERE v.status = 'active'
      AND NOT EXISTS (
        SELECT 1
        FROM services s
        WHERE s.vendor_id = v.id AND s.status = 'approved'
      )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vendor_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      profile_image VARCHAR(255) NULL,
      city VARCHAR(255) NULL,
      address TEXT NULL,
      bio TEXT NULL,
      website VARCHAR(255) NULL,
      instagram VARCHAR(255) NULL,
      facebook VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY vendor_profiles_vendor_unique (vendor_id),
      CONSTRAINT vendor_profiles_vendor_fk FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS vendor_documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      document_type VARCHAR(80) NOT NULL DEFAULT 'ID Proof',
      file_path VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX vendor_documents_vendor_idx (vendor_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS service_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(140) NOT NULL,
      type ENUM('event','vendor') NOT NULL DEFAULT 'vendor',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY service_categories_slug_unique (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    INSERT INTO service_categories (name, slug, type, sort_order)
    VALUES
      ('Destination Wedding', 'destination-wedding', 'event', 10),
      ('Corporate Events', 'corporate-events', 'event', 20),
      ('Resorts', 'resorts', 'event', 30),
      ('Banquet Halls', 'banquet-halls', 'event', 40),
      ('Gardens', 'gardens', 'vendor', 100),
      ('Decoration', 'decoration', 'vendor', 110),
      ('Photography', 'photography', 'vendor', 120),
      ('Caterers', 'caterers', 'vendor', 130),
      ('Makeup Artists', 'makeup-artists', 'vendor', 140),
      ('Mehendi Artists', 'mehendi-artists', 'vendor', 150),
      ('DJ Band', 'dj-band', 'vendor', 160),
      ('Anchor', 'anchor', 'vendor', 170),
      ('Car & Bus', 'transport', 'vendor', 180),
      ('Pandit Ji', 'pandit-ji', 'vendor', 190)
    ON DUPLICATE KEY UPDATE name = VALUES(name), type = VALUES(type), sort_order = VALUES(sort_order)
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NULL,
      slug VARCHAR(255) NULL,
      service_name VARCHAR(255) NULL,
      category VARCHAR(255) NULL,
      price VARCHAR(255) NULL,
      description TEXT NULL,
      features TEXT NULL,
      capacity VARCHAR(255) NULL,
      location VARCHAR(255) NULL,
      availability VARCHAR(255) NULL,
      contact_details TEXT NULL,
      whatsapp_number VARCHAR(50) NULL,
      video_url VARCHAR(255) NULL,
      status VARCHAR(50) DEFAULT 'pending',
      rejection_reason TEXT NULL,
      approved_by INT NULL,
      approved_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY services_slug_unique (slug),
      INDEX services_vendor_status_idx (vendor_id, status),
      INDEX services_category_status_idx (category, status),
      CONSTRAINT services_vendor_fk FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("services", "vendor_id", "INT NULL");
  await addColumnIfMissing("services", "slug", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "service_name", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "category", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "price", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "description", "TEXT NULL");
  await addColumnIfMissing("services", "features", "TEXT NULL");
  await addColumnIfMissing("services", "capacity", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "location", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "availability", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "contact_details", "TEXT NULL");
  await addColumnIfMissing("services", "whatsapp_number", "VARCHAR(50) NULL");
  await addColumnIfMissing("services", "video_url", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "status", "VARCHAR(50) DEFAULT 'pending'");
  await addColumnIfMissing("services", "rejection_reason", "TEXT NULL");
  await addColumnIfMissing("services", "approved_by", "INT NULL");
  await addColumnIfMissing("services", "approved_at", "TIMESTAMP NULL");
  await addColumnIfMissing("services", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await addColumnIfMissing("services", "updated_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  if (await columnExists("services", "name")) {
    await pool.execute(`UPDATE services SET service_name = name WHERE service_name IS NULL OR service_name = ''`);
  }
  if (await columnExists("services", "price_from")) {
    await pool.execute(`UPDATE services SET price = CAST(price_from AS CHAR) WHERE price IS NULL OR price = ''`);
  }
  await pool.execute(`
    UPDATE services
    SET
      service_name = COALESCE(NULLIF(service_name, ''), CONCAT('Service ', id)),
      slug = COALESCE(NULLIF(slug, ''), CONCAT('service-', id)),
      category = COALESCE(NULLIF(category, ''), 'Wedding Services'),
      price = COALESCE(NULLIF(price, ''), '0'),
      description = COALESCE(NULLIF(description, ''), 'Royal Vivah approved service.'),
      features = COALESCE(NULLIF(features, ''), JSON_ARRAY()),
      capacity = COALESCE(capacity, ''),
      location = COALESCE(NULLIF(location, ''), 'Jaipur'),
      availability = COALESCE(NULLIF(availability, ''), 'Available on request'),
      contact_details = COALESCE(NULLIF(contact_details, ''), ''),
      whatsapp_number = COALESCE(NULLIF(whatsapp_number, ''), ''),
      status = COALESCE(NULLIF(status, ''), 'pending')
  `);
  if (await columnExists("services", "name")) {
    await pool.execute("UPDATE services SET name = service_name WHERE name IS NULL OR name = ''");
  }

  if (await tableExists("vendor_services")) {
    await addColumnIfMissing("vendor_services", "vendor_id", "INT NULL");
    await addColumnIfMissing("vendor_services", "slug", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "service_name", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "category", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "price", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "description", "TEXT NULL");
    await addColumnIfMissing("vendor_services", "features", "TEXT NULL");
    await addColumnIfMissing("vendor_services", "capacity", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "location", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "availability", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "contact_details", "TEXT NULL");
    await addColumnIfMissing("vendor_services", "whatsapp_number", "VARCHAR(50) NULL");
    await addColumnIfMissing("vendor_services", "video_url", "VARCHAR(255) NULL");
    await addColumnIfMissing("vendor_services", "status", "VARCHAR(50) DEFAULT 'pending'");
    await addColumnIfMissing("vendor_services", "rejection_reason", "TEXT NULL");
    await addColumnIfMissing("vendor_services", "approved_by", "INT NULL");
    await addColumnIfMissing("vendor_services", "approved_at", "TIMESTAMP NULL");
    await addColumnIfMissing("vendor_services", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");

    const legacyName = await selectColumnOrDefault("vendor_services", "name", "NULL");
    const vendorServiceSelect = {
      vendor_id: await selectColumnOrDefault("vendor_services", "vendor_id", "NULL"),
      slug: await selectColumnOrDefault("vendor_services", "slug", "CONCAT('legacy-service-', id)"),
      service_name: await selectColumnOrDefault("vendor_services", "service_name", `COALESCE(${legacyName}, CONCAT('Service ', id))`),
      category: await selectColumnOrDefault("vendor_services", "category", "'Wedding Services'"),
      price: await selectColumnOrDefault("vendor_services", "price", "NULL"),
      description: await selectColumnOrDefault("vendor_services", "description", "NULL"),
      features: await selectColumnOrDefault("vendor_services", "features", "NULL"),
      capacity: await selectColumnOrDefault("vendor_services", "capacity", "NULL"),
      location: await selectColumnOrDefault("vendor_services", "location", "NULL"),
      availability: await selectColumnOrDefault("vendor_services", "availability", "NULL"),
      contact_details: await selectColumnOrDefault("vendor_services", "contact_details", "NULL"),
      whatsapp_number: await selectColumnOrDefault("vendor_services", "whatsapp_number", "NULL"),
      video_url: await selectColumnOrDefault("vendor_services", "video_url", "NULL"),
      status: await selectColumnOrDefault("vendor_services", "status", "'pending'"),
      rejection_reason: await selectColumnOrDefault("vendor_services", "rejection_reason", "NULL"),
      approved_by: await selectColumnOrDefault("vendor_services", "approved_by", "NULL"),
      approved_at: await selectColumnOrDefault("vendor_services", "approved_at", "NULL"),
      created_at: await selectColumnOrDefault("vendor_services", "created_at", "CURRENT_TIMESTAMP")
    };

    await pool.execute(`
      INSERT IGNORE INTO services
        (id, vendor_id, slug, service_name, category, price, description, features, capacity, location, availability, contact_details, whatsapp_number, video_url, status, rejection_reason, approved_by, approved_at, created_at)
      SELECT
        id,
        ${vendorServiceSelect.vendor_id},
        ${vendorServiceSelect.slug},
        ${vendorServiceSelect.service_name},
        ${vendorServiceSelect.category},
        ${vendorServiceSelect.price},
        ${vendorServiceSelect.description},
        ${vendorServiceSelect.features},
        ${vendorServiceSelect.capacity},
        ${vendorServiceSelect.location},
        ${vendorServiceSelect.availability},
        ${vendorServiceSelect.contact_details},
        ${vendorServiceSelect.whatsapp_number},
        ${vendorServiceSelect.video_url},
        ${vendorServiceSelect.status},
        ${vendorServiceSelect.rejection_reason},
        ${vendorServiceSelect.approved_by},
        ${vendorServiceSelect.approved_at},
        ${vendorServiceSelect.created_at}
      FROM vendor_services
    `);
  }

  await addColumnIfMissing("services", "video_url", "VARCHAR(255) NULL");
  await addColumnIfMissing("services", "rejection_reason", "TEXT NULL");
  await addColumnIfMissing("services", "approved_by", "INT NULL");
  await addColumnIfMissing(
    "services",
    "updated_at",
    "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
  await addUniqueKeyIfMissing("services", "services_slug_unique", "slug");

  await pool.execute(`
    INSERT INTO services
      (slug, service_name, category, price, description, features, capacity, location, availability, contact_details, whatsapp_number, status, approved_at)
    VALUES
      ('dummy-royal-palace-lawn', 'Royal Palace Lawn', 'Gardens', '275000', 'A premium Jaipur lawn for weddings, receptions and grand family celebrations.', JSON_ARRAY('Palace entry', 'Parking support', 'Bridal room', 'Outdoor lawn'), '500-1200 guests', 'Ajmer Road, Jaipur', 'Available for selected dates', '+91 98765 43210', '919876543210', 'approved', NOW()),
      ('dummy-amber-grand-garden', 'Amber Grand Garden', 'Gardens', '225000', 'A refined garden venue with flexible layouts, stage zones and guest hospitality support.', JSON_ARRAY('Mandap zone', 'Lighting support', 'Catering bay', 'Family rooms'), '300-900 guests', 'Vaishali Nagar, Jaipur', 'Available on request', '+91 98765 43210', '919876543210', 'approved', NOW()),
      ('dummy-lotus-celebration-greens', 'Lotus Celebration Greens', 'Gardens', '185000', 'A polished venue for engagement, reception, haldi, mehendi and intimate wedding functions.', JSON_ARRAY('Photo corners', 'Indoor support', 'Managed parking', 'Decor support'), '150-650 guests', 'Malviya Nagar, Jaipur', 'Good weekday availability', '+91 98765 43210', '919876543210', 'approved', NOW())
    ON DUPLICATE KEY UPDATE
      service_name = VALUES(service_name),
      category = VALUES(category),
      status = 'approved',
      approved_at = COALESCE(approved_at, NOW())
  `);
  if (await columnExists("services", "name")) {
    await pool.execute("UPDATE services SET name = service_name WHERE name IS NULL OR name = ''");
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS service_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NULL,
      file_path TEXT NULL,
      is_featured BOOLEAN DEFAULT FALSE,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX service_images_service_idx (service_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("service_images", "alt_text", "VARCHAR(180) NULL");
  await dropForeignKeyIfExists("service_images", "service_images_ibfk_1");
  await dropForeignKeyIfExists("service_images", "service_images_service_fk");
  await pool.execute(`
    DELETE si
    FROM service_images si
    LEFT JOIN services s ON s.id = si.service_id
    WHERE si.service_id IS NOT NULL AND s.id IS NULL
  `);
  await addForeignKeyIfMissing(
    "service_images",
    "service_images_service_fk",
    "FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE"
  );

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NOT NULL,
      service_id INT NULL,
      name VARCHAR(140) NOT NULL,
      email VARCHAR(180) NULL,
      mobile VARCHAR(24) NOT NULL,
      event_date DATE NULL,
      event_type VARCHAR(100) NULL,
      guest_count INT NULL,
      message TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX inquiries_vendor_idx (vendor_id),
      INDEX inquiries_service_idx (service_id),
      CONSTRAINT inquiries_vendor_fk FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
      CONSTRAINT inquiries_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  if (await tableExists("vendor_inquiries") && await columnExists("vendor_inquiries", "service_id")) {
    await pool.execute(`
      INSERT IGNORE INTO inquiries (id, vendor_id, service_id, name, mobile, event_date, message, status, created_at)
      SELECT id, vendor_id, service_id, name, mobile, event_date, message, COALESCE(status, 'new'), created_at
      FROM vendor_inquiries
    `);
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS availability (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NOT NULL,
      available_date DATE NOT NULL,
      status ENUM('available','blocked','booked') NOT NULL DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY availability_unique_date (service_id, available_date),
      KEY availability_status_idx (service_id, status),
      CONSTRAINT availability_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS venues (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(180) NOT NULL,
      slug VARCHAR(180) NULL,
      location VARCHAR(220) NULL,
      address TEXT NULL,
      capacity_min INT NULL,
      capacity_max INT NULL,
      base_price DECIMAL(12,2) NULL,
      amenities JSON NULL,
      media JSON NULL,
      active BOOLEAN DEFAULT TRUE,
      availability_status VARCHAR(50) NOT NULL DEFAULT 'available',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("venues", "slug", "VARCHAR(180) NULL");
  await addColumnIfMissing("venues", "location", "VARCHAR(220) NULL");
  await addColumnIfMissing("venues", "address", "TEXT NULL");
  await addColumnIfMissing("venues", "capacity_min", "INT NULL");
  await addColumnIfMissing("venues", "capacity_max", "INT NULL");
  await addColumnIfMissing("venues", "base_price", "DECIMAL(12,2) NULL");
  await addColumnIfMissing("venues", "amenities", "JSON NULL");
  await addColumnIfMissing("venues", "media", "JSON NULL");
  await addColumnIfMissing("venues", "active", "BOOLEAN DEFAULT TRUE");
  await addColumnIfMissing("venues", "availability_status", "VARCHAR(50) NOT NULL DEFAULT 'available'");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      vendor_id INT NULL,
      service_id INT NULL,
      venue_id INT NULL,
      customer_name VARCHAR(140) NULL,
      customer_email VARCHAR(180) NULL,
      customer_phone VARCHAR(24) NULL,
      name VARCHAR(140) NULL,
      mobile VARCHAR(24) NULL,
      event_date DATE NULL,
      event_type VARCHAR(100) NULL,
      guest_count INT NULL,
      message TEXT NULL,
      amount DECIMAL(12,2) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("bookings", "user_id", "INT NULL");
  await addColumnIfMissing("bookings", "vendor_id", "INT NULL");
  await addColumnIfMissing("bookings", "service_id", "INT NULL");
  await addColumnIfMissing("bookings", "venue_id", "INT NULL");
  await addColumnIfMissing("bookings", "customer_name", "VARCHAR(140) NULL");
  await addColumnIfMissing("bookings", "customer_email", "VARCHAR(180) NULL");
  await addColumnIfMissing("bookings", "customer_phone", "VARCHAR(24) NULL");
  await addColumnIfMissing("bookings", "name", "VARCHAR(140) NULL");
  await addColumnIfMissing("bookings", "mobile", "VARCHAR(24) NULL");
  await addColumnIfMissing("bookings", "event_date", "DATE NULL");
  await addColumnIfMissing("bookings", "event_type", "VARCHAR(100) NULL");
  await addColumnIfMissing("bookings", "city", "VARCHAR(120) NULL");
  await addColumnIfMissing("bookings", "guest_count", "INT NULL");
  await addColumnIfMissing("bookings", "selected_services", "TEXT NULL");
  await addColumnIfMissing("bookings", "match_score", "INT NULL");
  await addColumnIfMissing("bookings", "recommended_package", "VARCHAR(180) NULL");
  await addColumnIfMissing("bookings", "message", "TEXT NULL");
  await addColumnIfMissing("bookings", "amount", "DECIMAL(12,2) NULL");
  await addColumnIfMissing("bookings", "status", "VARCHAR(50) NOT NULL DEFAULT 'pending'");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      booking_id INT NULL,
      vendor_id INT NULL,
      amount DECIMAL(12,2) NOT NULL DEFAULT 0,
      gateway VARCHAR(80) NOT NULL DEFAULT 'manual',
      transaction_id VARCHAR(180) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      vendor_id INT NULL,
      service_id INT NULL,
      customer_name VARCHAR(140) NOT NULL,
      rating DECIMAL(2,1) NOT NULL DEFAULT 5.0,
      feedback TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX reviews_vendor_idx (vendor_id),
      INDEX reviews_service_idx (service_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("reviews", "vendor_id", "INT NULL");
  await addColumnIfMissing("reviews", "service_id", "INT NULL");
  await addColumnIfMissing("reviews", "customer_name", "VARCHAR(140) NULL");
  await addColumnIfMissing("reviews", "rating", "DECIMAL(2,1) NOT NULL DEFAULT 5.0");
  await addColumnIfMissing("reviews", "feedback", "TEXT NULL");
  await addColumnIfMissing("reviews", "status", "VARCHAR(50) NOT NULL DEFAULT 'pending'");
  await addColumnIfMissing("reviews", "featured", "BOOLEAN NOT NULL DEFAULT FALSE");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS quick_planner_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL,
      mobile VARCHAR(24) NOT NULL,
      email VARCHAR(180) NULL,
      event_type VARCHAR(100) NOT NULL,
      event_date DATE NULL,
      guest_count INT NULL,
      budget VARCHAR(120) NULL,
      city VARCHAR(120) NULL,
      required_services TEXT NULL,
      recommended_services TEXT NULL,
      notes TEXT NULL,
      match_score INT NULL,
      recommended_package VARCHAR(180) NULL,
      booking_id INT NULL,
      lead_status VARCHAR(50) NOT NULL DEFAULT 'new',
      booking_status VARCHAR(50) NOT NULL DEFAULT 'not_booked',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("quick_planner_requests", "email", "VARCHAR(180) NULL");
  await addColumnIfMissing("quick_planner_requests", "event_date", "DATE NULL");
  await addColumnIfMissing("quick_planner_requests", "required_services", "TEXT NULL");
  await addColumnIfMissing("quick_planner_requests", "recommended_services", "TEXT NULL");
  await addColumnIfMissing("quick_planner_requests", "notes", "TEXT NULL");
  await addColumnIfMissing("quick_planner_requests", "match_score", "INT NULL");
  await addColumnIfMissing("quick_planner_requests", "recommended_package", "VARCHAR(180) NULL");
  await addColumnIfMissing("quick_planner_requests", "booking_id", "INT NULL");
  await addColumnIfMissing("quick_planner_requests", "lead_status", "VARCHAR(50) NOT NULL DEFAULT 'new'");
  await addColumnIfMissing("quick_planner_requests", "booking_status", "VARCHAR(50) NOT NULL DEFAULT 'not_booked'");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL,
      mobile VARCHAR(24) NOT NULL,
      email VARCHAR(180) NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS service_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      service_id INT NOT NULL,
      booking_id INT NOT NULL,
      customer_name VARCHAR(140) NOT NULL,
      rating TINYINT NOT NULL DEFAULT 5,
      review TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY service_reviews_booking_unique (booking_id),
      INDEX service_reviews_service_idx (service_id),
      CONSTRAINT service_reviews_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
      CONSTRAINT service_reviews_booking_fk FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL,
      email VARCHAR(180) NULL,
      phone VARCHAR(24) NULL,
      subject VARCHAR(180) NULL,
      message TEXT NOT NULL,
      source VARCHAR(80) NOT NULL DEFAULT 'website',
      status VARCHAR(50) NOT NULL DEFAULT 'new',
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("contacts", "is_read", "BOOLEAN NOT NULL DEFAULT FALSE");

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS gallery_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(180) NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'photo',
      url VARCHAR(255) NOT NULL,
      venue_id INT NULL,
      service_id INT NULL,
      event_type VARCHAR(80) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS gallery_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(140) NOT NULL,
      slug VARCHAR(160) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY gallery_categories_slug_unique (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      service_id INT NULL,
      title VARCHAR(180) NULL,
      image_url VARCHAR(255) NULL,
      video_url VARCHAR(255) NULL,
      alt_text VARCHAR(180) NULL,
      sort_order INT NOT NULL DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX gallery_images_category_idx (category_id),
      INDEX gallery_images_service_idx (service_id),
      CONSTRAINT gallery_images_category_fk FOREIGN KEY (category_id) REFERENCES gallery_categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await addColumnIfMissing("gallery_images", "service_id", "INT NULL");
  await addColumnIfMissing("gallery_images", "video_url", "VARCHAR(255) NULL");

  await pool.execute(`
    INSERT INTO gallery_categories (name, slug, sort_order)
    VALUES
      ('Wedding Gallery', 'wedding-gallery', 10),
      ('Reception Gallery', 'reception-gallery', 20),
      ('Engagement Gallery', 'engagement-gallery', 30),
      ('Haldi Gallery', 'haldi-gallery', 40),
      ('Mehendi Gallery', 'mehendi-gallery', 50),
      ('Corporate Event Gallery', 'corporate-event-gallery', 60),
      ('Birthday Event Gallery', 'birthday-event-gallery', 70)
    ON DUPLICATE KEY UPDATE name = VALUES(name), sort_order = VALUES(sort_order), status = 'active'
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(180) NOT NULL,
      title VARCHAR(220) NOT NULL,
      category VARCHAR(120) NULL,
      excerpt TEXT NULL,
      content LONGTEXT NULL,
      image VARCHAR(255) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      published_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY blog_posts_slug_unique (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS event_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(140) NOT NULL,
      title VARCHAR(180) NOT NULL,
      image VARCHAR(255) NULL,
      description TEXT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY event_types_slug_unique (slug)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS faqs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      question VARCHAR(255) NOT NULL,
      answer TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipient_type VARCHAR(50) NOT NULL DEFAULT 'admin',
      recipient_id INT NULL,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      link VARCHAR(255) NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
  const passwordHash = await hashPassword(
    process.env.ADMIN_PASSWORD
  );

  await pool.execute(
    `
    INSERT INTO admins
    (
      name,
      email,
      password_hash,
      role,
      status
    )
    VALUES
    (
      ?, ?, ?, 'super_admin', 'active'
    )
    ON DUPLICATE KEY UPDATE
      password_hash = VALUES(password_hash),
      status = 'active',
      role = 'super_admin'
    `,
    [
      process.env.ADMIN_NAME || "Royal Vivah Admin",
      process.env.ADMIN_EMAIL,
      passwordHash
    ]
  );
  }
}
