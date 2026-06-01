CREATE DATABASE IF NOT EXISTS booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS vendors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255) NOT NULL,
  email VARCHAR(180) NOT NULL,
  phone VARCHAR(24) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL,
  profile_image VARCHAR(255) NULL,
  social_links JSON NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  remember_token VARCHAR(120) NULL,
  password_reset_token VARCHAR(255) NULL,
  password_reset_expires_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY vendors_email_unique (email),
  KEY vendors_status_idx (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  slug VARCHAR(140) NOT NULL,
  type ENUM('event','vendor') NOT NULL DEFAULT 'vendor',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY service_categories_slug_unique (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id INT NOT NULL,
  slug VARCHAR(255) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  features JSON NULL,
  capacity VARCHAR(255) NULL,
  location VARCHAR(255) NOT NULL,
  availability VARCHAR(255) NOT NULL,
  contact_details TEXT NOT NULL,
  whatsapp_number VARCHAR(50) NOT NULL,
  video_url VARCHAR(255) NULL,
  status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  rejection_reason TEXT NULL,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY services_slug_unique (slug),
  KEY services_vendor_status_idx (vendor_id, status),
  KEY services_category_status_idx (category, status),
  CONSTRAINT services_vendor_fk FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS service_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  file_path TEXT NOT NULL,
  alt_text VARCHAR(180) NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY service_images_service_idx (service_id),
  CONSTRAINT service_images_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  vendor_id INT NULL,
  service_id INT NULL,
  venue_id INT NULL,
  customer_name VARCHAR(140) NULL,
  customer_email VARCHAR(180) NULL,
  customer_phone VARCHAR(24) NULL,
  event_date DATE NULL,
  event_type VARCHAR(100) NULL,
  guest_count INT NULL,
  message TEXT NULL,
  amount DECIMAL(12,2) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY bookings_vendor_idx (vendor_id),
  KEY bookings_service_idx (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY inquiries_vendor_idx (vendor_id),
  KEY inquiries_service_idx (service_id),
  CONSTRAINT inquiries_vendor_fk FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT inquiries_service_fk FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  KEY reviews_vendor_idx (vendor_id),
  KEY reviews_service_idx (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'photo',
  url VARCHAR(255) NOT NULL,
  venue_id INT NULL,
  service_id INT NULL,
  event_type VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  answer TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
